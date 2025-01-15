// tailwind.config.js
module.exports = {
  content: [
    "./index.html", // Asegúrate de incluir tu archivo HTML para que Tailwind lo procese
    "./js/app.js", // Si tienes más archivos JS, agrega las rutas correspondientes
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3490dc', // Puedes definir colores personalizados
        secondary: '#ffed4a',
      },
      spacing: {
        '128': '32rem',
      },
    },
  },
  plugins: [],
}
