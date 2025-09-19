const getApiUrl = () => {
  if (window.location.hostname === "localhost") {
    return "http://localhost:4000";
  } else {
    return "https://jamrock-back.onrender.com";
  }
};

const API_URL = getApiUrl();
export default API_URL;
