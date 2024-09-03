// utils/response.js
const baseResponse = (code, data, message) => {
  return {
    code,
    data,
    message,
  };
};

module.exports = baseResponse;
