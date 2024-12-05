const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const http = require('http');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const categoryRoutes = require('./routes/category')

const db = require('./config/connection');

db();

const app = express();
const server = http.createServer(app);

// Middleware setup
app.use(cookieParser());
app.use(express.json());

// CORS setup
app.use(cors({
  // origin: 'https://western19.netlify.app', // Allow the frontend origin
  origin: 'http://localhost:4200',
  methods: ['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT','PATCH','DELETE'], // Allow methods
  credentials: true // Allow cookies to be sent
}));

// Routes
app.use("/", userRoutes);
app.use("/admin", adminRoutes);
app.use("/category", categoryRoutes)


app.use('/uploads', express.static('uploads'));

// Session setup
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Start server
server.listen(5000, () => {
  console.log("App is listening on port 5000");
});


app.use(express.json({ limit: '50mb' })); // Adjust the size as needed
app.use(express.urlencoded({ limit: '50mb', extended: true }));