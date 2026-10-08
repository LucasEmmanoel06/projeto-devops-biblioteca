// Configuração do frontend.
// API_BASE vazio = mesma origem do site (backend serve o frontend ou há proxy).
// Para desenvolvimento com o backend em outra porta, use por exemplo:
//   window.APP_CONFIG = { API_BASE: "http://localhost:5000" };
// No Docker Compose esse arquivo pode ser sobrescrito sem alterar o restante do código.
window.APP_CONFIG = {
  API_BASE: ""
};