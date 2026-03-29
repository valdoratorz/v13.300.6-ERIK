const tokenCharset = "0123456789abcdefghijklmnopqrstuvwxyz";
const generateToken = () => {
  let token = "";
  for (let i = 0; i < 20; i++) {
    token += tokenCharset.charAt(
      Math.floor(Math.random() * tokenCharset.length),
    );
  }
  return token;
};

module.exports.generateToken = generateToken;
