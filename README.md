# HarvestChain 🌾

A blockchain-based agricultural supply chain management system that enables farmers to track their produce from farm to consumer, ensuring transparency and traceability throughout the entire supply chain.

## Features

- **Farmer Dashboard**: Register, login, and manage agricultural produce
- **Admin Dashboard**: Monitor and manage the entire supply chain
- **QR Code Integration**: Generate and scan QR codes for product tracking
- **Phone Authentication**: Secure authentication using phone numbers
- **Real-time Tracking**: Track products through the supply chain
- **Blockchain Integration**: Immutable record keeping using blockchain technology

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **React Query** for data fetching
- **Wouter** for routing

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **MongoDB** with Mongoose for database
- **Firebase** for authentication
- **QR Code** generation and scanning

### Deployment
- **Vercel** for hosting
- **MongoDB Atlas** for database hosting

## Prerequisites

Before running this project, make sure you have:

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- Firebase project setup

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd HarvestChain
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory with the following variables:
   ```env
   # MongoDB Configuration
   MONGODB_URI=your_mongodb_connection_string
   
   # Firebase Configuration
   FIREBASE_API_KEY=your_firebase_api_key
   FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   FIREBASE_APP_ID=your_firebase_app_id
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Session Secret (generate a random string)
   SESSION_SECRET=your_session_secret_here
   ```

4. **Database Setup**
   
   Make sure your MongoDB Atlas cluster is running and accessible. The application will automatically create the necessary collections when you first run it.

## Development

### Running the Development Server

```bash
npm run dev
```

This will start both the frontend and backend servers:
- Frontend: Available at `http://localhost:5000`
- Backend API: Available at `http://localhost:5000/api`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:client` - Build only the client
- `npm run build:server` - Build only the server
- `npm run start` - Start production server
- `npm run start:prod` - Build and start production server
- `npm run check` - Run TypeScript type checking
- `npm run preview` - Preview production build

## Project Structure

```
HarvestChain/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── lib/          # Utility libraries
│   │   └── hooks/        # Custom React hooks
│   └── index.html
├── server/                # Backend Express server
│   ├── config/           # Database configuration
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   └── services/         # Business logic
├── shared/               # Shared schemas and types
├── api/                  # Vercel serverless functions
├── vercel.json          # Vercel configuration
└── package.json
```

## API Endpoints

### Farmer Routes
- `POST /api/farmers/register` - Register a new farmer
- `POST /api/farmers/login` - Farmer login
- `GET /api/farmers/profile` - Get farmer profile
- `PUT /api/farmers/profile` - Update farmer profile
- `POST /api/farmers/products` - Add new product
- `GET /api/farmers/products` - Get farmer's products

### Admin Routes
- `POST /api/admin/login` - Admin login
- `GET /api/admin/farmers` - Get all farmers
- `GET /api/admin/products` - Get all products
- `PUT /api/admin/products/:id/status` - Update product status

## Deployment

### Deploying to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Set the following environment variables in Vercel dashboard:
     - `MONGODB_URI`
     - `FIREBASE_API_KEY`
     - `FIREBASE_AUTH_DOMAIN`
     - `FIREBASE_PROJECT_ID`
     - `FIREBASE_STORAGE_BUCKET`
     - `FIREBASE_MESSAGING_SENDER_ID`
     - `FIREBASE_APP_ID`
     - `SESSION_SECRET`
   - Deploy!

### Environment Variables for Production

Make sure to set all the environment variables in your Vercel dashboard under Settings > Environment Variables.

## Usage

1. **For Farmers:**
   - Register an account using phone authentication
   - Login to access the farmer dashboard
   - Add products with details and generate QR codes
   - Track product status through the supply chain

2. **For Admins:**
   - Login using admin credentials
   - Monitor all farmers and products
   - Update product status as they move through the supply chain
   - Generate reports and analytics

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please:
1. Check the [Issues](https://github.com/your-username/HarvestChain/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Integration with IoT sensors
- [ ] Multi-language support
- [ ] Advanced reporting features
- [ ] Integration with external logistics providers

---

Made with ❤️ for sustainable agriculture and transparent supply chains.