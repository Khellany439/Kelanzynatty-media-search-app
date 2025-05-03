
# Open-License Media Search Web App

![Open-License Media Search Banner](https://via.placeholder.com/1200x400.png?text=Open-License+Media+Search)

**Open-License Media Search Web App** is a comprehensive, scalable, and user-friendly web application designed to help users search, filter, and retrieve open-license media from various sources. The app integrates seamlessly with the **Openverse API** for accessing openly-licensed images, audio, and video resources, empowering users to find the media they need for various creative projects.

## 🚀 Features

- **User Authentication:** Secure registration, login, and authentication using JWT tokens.
- **Search Interface:** Advanced search capabilities using Openverse API to find open-license media.
- **Media Display:** Displays media results, including images, videos, and audio with proper controls.
- **Search History:** Users can save, retrieve, and manage their recent search queries for quick access.
- **Responsive UI:** Fully responsive design, adapting seamlessly to mobile and desktop views.
- **Secure Data Handling:** Uses bcrypt for password hashing and ensures sensitive user data is stored securely.

## 🛠️ Tech Stack

- **Frontend:**
  - React.js with Vite (for fast builds)
  - Axios for API requests
  - React Router for routing
  - Material-UI for UI components (or you could use Bootstrap/Tailwind)
- **Backend:**
  - Node.js with Express.js
  - PostgreSQL with Sequelize ORM
  - JWT for secure authentication
  - Openverse API integration
- **Containerization & Deployment:**
  - Docker for containerizing the app
  - GitHub Actions for CI/CD pipeline
  - Automated tests with Jest or Mocha
- **DevOps:**
  - Kubernetes (optional for large-scale deployments)
  - Prometheus (for app monitoring)
  - AWS for cloud hosting
  - Nginx as a reverse proxy

## 📸 Screenshots

![Login Screen](https://via.placeholder.com/600x400.png?text=Login+Page)
![Search Results](https://via.placeholder.com/600x400.png?text=Search+Results)

## 🔗 Links
- **Live Demo:** [Visit the live app here](https://example.com) (Replace with your hosted app URL)
- **Openverse API Documentation:** [Openverse API Docs](https://api.openverse.org/v1/)
- **Frontend Repository:** [Frontend GitHub Repository](https://github.com/Khellany439/Kelanzynatty-open-media-search-app)
- **Backend Repository:** [Backend GitHub Repository](https://github.com/Khellany439/Kelanzynatty-open-media-search-app)

## ⚙️ Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/open-media-search-app.git
cd open-media-search-app
```

### 2. Backend Setup

#### Install Backend Dependencies:

```bash
cd backend
npm install
```

#### Configure Environment Variables:

Create a `.env` file and add the following variables:

```bash
PORT=5000
DB_NAME=open_media_search
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_HOST=localhost
JWT_SECRET=your_jwt_secret_key
```

#### Initialize PostgreSQL Database:

Make sure PostgreSQL is installed and running. Create the database:

```bash
createdb open_media_search
```

#### Run Backend Server:

To run the backend server, execute the following:

```bash
npx nodemon server.js
```

### 3. Frontend Setup

#### Install Frontend Dependencies:

```bash
cd frontend
npm install
```

#### Configure Environment Variables:

Create a `.env` file and add the following:

```env
VITE_API_URL=http://localhost:5000
```

#### Run Frontend Development Server:

Start the frontend:

```bash
npm run dev
```

Frontend should be running at `http://localhost:3000`.

## 🚢 Deployment with Docker

To simplify deployment, you can use Docker to containerize both frontend and backend.

### 1. Build Docker Images

```bash
docker-compose build
```

### 2. Start Containers

```bash
docker-compose up
```

This will spin up both the backend and frontend in separate containers.

## 🧪 Testing

### 1. Backend Testing

Run tests for the backend:

```bash
npm run test
```

### 2. Frontend Testing

Run tests for the frontend:

```bash
npm run test
```

## 🌍 Deployment

- **Backend Deployment:** Deploy the backend to cloud providers such as Heroku, AWS EC2, or DigitalOcean.
- **Frontend Deployment:** Use platforms like Vercel, Netlify, or AWS Amplify to host the frontend.

## 🤝 Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch for your feature (`git checkout -b feature-name`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to your branch (`git push origin feature-name`).
5. Create a pull request to the main repository.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📚 Acknowledgements

- **Openverse API** for providing open-license media data.
- **Sequelize** for simplifying PostgreSQL integration.
- **JWT** for secure user authentication.

## 🔧 Tools & Resources

- [Node.js](https://nodejs.org/)
- [React.js](https://reactjs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Openverse API](https://api.openverse.org/)
- [Docker](https://www.docker.com/)
- [JWT Authentication](https://jwt.io/)

---

*Made with ❤️ by [Khellany439](https://github.com/khellany439)*

