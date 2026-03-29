const { spawn } = require("child_process");
const { watch } = require("fs");
const fs = require("fs/promises");
const path = require("path");
const { fileURLToPath } = require("url");
const crypto = require("crypto");

class FridaCompiler {
  constructor(options = {}) {
    this.inputFile = options.input;
    this.outputFile = options.output || "compiled.js";
    this.watch = options.watch || false;
    this.minify = options.minify || false;
    this.sourcemap = options.sourcemap || false;
    this.obfuscate = options.obfuscate || false;
    this.target = options.target || "auto";
    this.verbose = options.verbose || false;

    // Create temp directory for build
    this.tempDir = path.join(__dirname, ".frida-temp");
  }

  async init() {
    // Create temp directory
    await fs.mkdir(this.tempDir, { recursive: true });

    // Create package.json if it doesn't exist
    await this.ensurePackageJson();

    // Install required dependencies
    await this.installDependencies();

    // Create frida-compile config
    await this.createFridaConfig();
  }

  async ensurePackageJson() {
    const pkgPath = path.join(this.tempDir, "package.json");

    try {
      await fs.access(pkgPath);
    } catch {
      const pkg = {
        name: "frida-script",
        version: "1.0.0",
        type: "module",
        scripts: {
          build:
            "frida-compile index.js -o ../" +
            this.outputFile +
            (this.minify ? " -c" : "") +
            (this.sourcemap ? " -g" : "") +
            (this.watch ? " -w" : ""),
        },
        devDependencies: {
          "frida-compile": "^16.4.1",
          "@types/frida-gum": "^18.5.1",
        },
      };

      // Add obfuscator if needed
      if (this.obfuscate) {
        pkg.devDependencies["javascript-obfuscator"] = "^4.1.0";
        pkg.scripts.obfuscate =
          "javascript-obfuscator ../" +
          this.outputFile +
          " --output ../" +
          this.outputFile.replace(".js", ".obf.js") +
          " --string-array true --string-array-encoding base64 --control-flow-flattening false";
      }

      await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2));
    }
  }

  async installDependencies() {
    this.log("Installing dependencies...");
    await this.exec("npm", ["install"], { cwd: this.tempDir });
  }

  async createFridaConfig() {
    // Read and process input file
    let source = await fs.readFile(this.inputFile, "utf-8");

    // Auto-detect and add required bridges
    source = await this.addRequiredBridges(source);

    // Create modular structure
    await this.createModularStructure(source);
  }

  async addRequiredBridges(source) {
    const bridges = [];

    if (source.includes("Java.") && !source.includes("frida-java-bridge")) {
      bridges.push("Java");
    }
    if (source.includes("ObjC.") && !source.includes("frida-objc-bridge")) {
      bridges.push("ObjC");
    }
    if (source.includes("Swift.") && !source.includes("frida-swift-bridge")) {
      bridges.push("Swift");
    }

    if (bridges.length > 0) {
      const importStatements = bridges
        .map((b) => `import ${b} from 'frida-${b.toLowerCase()}-bridge';`)
        .join("\n");

      source = importStatements + "\n\n" + source;
      this.log(`Added imports for: ${bridges.join(", ")}`);
    }

    return source;
  }

  async createModularStructure(source) {
    // Split source into logical modules
    const modules = this.splitIntoModules(source);

    // Write main index.js
    const indexPath = path.join(this.tempDir, "index.js");
    await fs.writeFile(indexPath, modules.main);

    // Write utility modules
    if (modules.utils) {
      const utilsPath = path.join(this.tempDir, "utils.js");
      await fs.writeFile(utilsPath, modules.utils);
    }

    // Write hook modules
    if (modules.hooks) {
      const hooksPath = path.join(this.tempDir, "hooks.js");
      await fs.writeFile(hooksPath, modules.hooks);
    }

    this.log("Created modular structure in " + this.tempDir);
  }

  splitIntoModules(source) {
    // Extract utility functions
    const utilsMatch =
      source.match(/(function\s+\w+\s*\([^)]*\)\s*\{[^}]+\})/g) || [];
    const utils =
      utilsMatch.length > 0
        ? utilsMatch.map((f) => `export ${f}`).join("\n\n")
        : "";

    // Extract hook definitions
    const hooksMatch =
      source.match(/(Interceptor\.(attach|replace)\s*\([^;]+;)/g) || [];
    const hooks =
      hooksMatch.length > 0
        ? hooksMatch
            .map(
              (h) =>
                `export function setupHook${crypto.randomBytes(4).toString("hex")}() { ${h} }`,
            )
            .join("\n\n")
        : "";

    // Create main file with imports
    let main = source;
    if (utils) {
      main = `import * as utils from './utils.js';\n\n${main}`;
    }
    if (hooks) {
      main = `import { setupHook1, setupHook2 } from './hooks.js';\n\n${main}`;
    }

    // Wrap main in a perform function
    main = `
function main() {
    ${main}
}

// Auto-execute
if (typeof module === 'undefined' || !module.parent) {
    main();
}

export default main;
`;

    return { main, utils, hooks };
  }

  async compile() {
    this.log(`Compiling ${this.inputFile} -> ${this.outputFile}...`);

    // Run frida-compile
    await this.exec("npm", ["run", "build"], { cwd: this.tempDir });

    const outputPath = path.join(process.cwd(), this.outputFile);
    this.log(`✅ Compiled successfully: ${outputPath}`);

    // Run obfuscation if requested
    if (this.obfuscate) {
      await this.obfuscateOutput();
    }

    // Clean up temp directory
    if (!this.verbose) {
      await fs.rm(this.tempDir, { recursive: true, force: true });
    }

    return outputPath;
  }

  async obfuscateOutput() {
    this.log("Obfuscating output...");
    await this.exec("npm", ["run", "obfuscate"], { cwd: this.tempDir });

    const obfPath = this.outputFile.replace(".js", ".obf.js");
    this.log(`✅ Obfuscated: ${obfPath}`);
  }

  async watchMode() {
    this.log(`Watching ${this.inputFile} for changes...`);

    const watcher = watch(
      path.dirname(this.inputFile),
      async (event, filename) => {
        if (filename === path.basename(this.inputFile)) {
          this.log(`\n🔄 File changed, recompiling...`);
          await this.compile();
        }
      },
    );

    // Initial compile
    await this.compile();

    // Keep process alive
    return new Promise(() => {});
  }

  async exec(command, args, options = {}) {
    return new Promise((resolve, reject) => {
      const proc = spawn(command, args, {
        ...options,
        shell: true,
        stdio: this.verbose ? "inherit" : "pipe",
      });

      let stdout = "";
      let stderr = "";

      if (!this.verbose) {
        proc.stdout.on("data", (data) => (stdout += data));
        proc.stderr.on("data", (data) => (stderr += data));
      }

      proc.on("close", (code) => {
        if (code === 0) resolve(stdout);
        else reject(new Error(stderr || `Command failed with code ${code}`));
      });
    });
  }

  log(message) {
    console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
  }

  async cleanup() {
    if (!this.verbose) {
      await fs
        .rm(this.tempDir, { recursive: true, force: true })
        .catch(() => {});
    }
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.length === 0) {
    console.log(`
🚀 Enhanced Frida Script Compiler
==================================
Usage: node compile-frida.js <input.js> [options]

Options:
  -o, --output <file>    Output file name (default: compiled.js)
  -w, --watch            Watch for changes and recompile
  -m, --minify          Minify the output
  -s, --sourcemap       Generate source maps
  -b, --obfuscate       Obfuscate the output (string encoding)
  -t, --target <type>   Target platform (auto/android/ios)
  -v, --verbose         Show verbose output
  --help                Show this help

Examples:
  node compile-frida.js script.js -o hooked.js
  node compile-frida.js script.js -w -m -o dist/app.js
  node compile-frida.js script.js -b -o secure.js
        `);
    return;
  }

  const inputFile = args.find((arg) => !arg.startsWith("-"));
  if (!inputFile) {
    console.error("❌ Error: No input file specified");
    process.exit(1);
  }

  const options = {
    input: inputFile,
    output: getArgValue(args, "-o", "--output"),
    watch: args.includes("-w") || args.includes("--watch"),
    minify: args.includes("-m") || args.includes("--minify"),
    sourcemap: args.includes("-s") || args.includes("--sourcemap"),
    obfuscate: args.includes("-b") || args.includes("--obfuscate"),
    target: getArgValue(args, "-t", "--target") || "auto",
    verbose: args.includes("-v") || args.includes("--verbose"),
  };

  const compiler = new FridaCompiler(options);

  try {
    await compiler.init();

    if (options.watch) {
      await compiler.watchMode();
    } else {
      await compiler.compile();
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await compiler.cleanup();
  }
}

function getArgValue(args, short, long) {
  const index = args.findIndex((arg) => arg === short || arg === long);
  return index !== -1 && args[index + 1] ? args[index + 1] : null;
}

main();
