const fs = require("fs");
const path = require("path");

class Database {
  constructor(filePath) {
    if (!filePath) {
      throw new Error("A JSON file path must be provided.");
    }

    this.filePath = path.resolve(filePath);

    // Create file if it doesn't exist
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }

    this._load();
  }

  /* ==============================
     INTERNAL HELPERS
  ============================== */

  _load() {
    try {
      const raw = fs.readFileSync(this.filePath, "utf8");
      this.data = JSON.parse(raw);
      if (!Array.isArray(this.data)) this.data = [];
    } catch {
      this.data = [];
    }
  }

  _save() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
  }

  _generateId() {
    if (!this.data.length) return 1;

    const maxId = this.data.reduce((max, item) => {
      const id = typeof item._systemid === "number" ? item._systemid : 0;
      return id > max ? id : max;
    }, 0);

    return maxId + 1;
  }

  _deepEqual(obj1, obj2) {
    if (obj1 === obj2) return true;

    if (
      typeof obj1 !== "object" ||
      obj1 === null ||
      typeof obj2 !== "object" ||
      obj2 === null
    ) {
      return false;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (let key of keys1) {
      if (!this._deepEqual(obj1[key], obj2[key])) {
        return false;
      }
    }

    return true;
  }

  _matches(item, attributes) {
    const keys = Object.keys(attributes);

    for (let key of keys) {
      const value = attributes[key];
      const itemValue = item[key];

      if (typeof value === "object" && value !== null) {
        if (!this._deepEqual(itemValue, value)) return false;
      } else {
        if (itemValue !== value) return false;
      }
    }

    return true;
  }

  /* ==============================
     CRUD OPERATIONS
  ============================== */

  // CREATE
  create(record) {
    const newRecord = {
      _systemid: this._generateId(),
      ...record,
    };

    this.data.push(newRecord);
    this._save();
    return newRecord;
  }

  // READ ALL
  getAll() {
    return this.data;
  }

  // READ BY ID
  getById(id) {
    return this.data.find((item) => item._systemid === id) || null;
  }

  // UPDATE
  update(id, updates) {
    const index = this.data.findIndex((item) => item._systemid === id);
    if (index === -1) return null;

    // Prevent overriding _systemid
    const { _systemid, ...safeUpdates } = updates;

    this.data[index] = {
      ...this.data[index],
      ...safeUpdates,
      _systemid: id,
    };

    this._save();
    return this.data[index];
  }

  // DELETE
  delete(id) {
    const index = this.data.findIndex((item) => item._systemid === id);
    if (index === -1) return false;

    this.data.splice(index, 1);
    this._save();
    return true;
  }

  /* ==============================
     FIND OPERATIONS
  ============================== */

  // FIND MANY (supports nested objects)
  findBy(attributes) {
    return this.data.filter((item) => this._matches(item, attributes));
  }

  // FIND ONE (optimized + deep support)
  findOneBy(attributes) {
    const attrKeys = Object.keys(attributes);
    const attrLength = attrKeys.length;

    for (let i = 0; i < this.data.length; i++) {
      const item = this.data[i];
      let match = true;

      for (let j = 0; j < attrLength; j++) {
        const key = attrKeys[j];
        const value = attributes[key];
        const itemValue = item[key];

        if (typeof value === "object" && value !== null) {
          if (!this._deepEqual(itemValue, value)) {
            match = false;
            break;
          }
        } else {
          if (itemValue !== value) {
            match = false;
            break;
          }
        }
      }

      if (match) return item;
    }

    return null;
  }
}

module.exports = Database;
