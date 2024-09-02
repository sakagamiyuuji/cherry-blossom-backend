// utils/response.js
const baseResponse = (data, code, message) => {
  return {
    data,
    code,
    message,
  };
};

module.exports = baseResponse;
