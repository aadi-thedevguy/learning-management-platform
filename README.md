# Learner Management Platform

A modern, full-stack learner management platform built with Tanstack Start. This platform allows educators to create, manage, and deliver online courses with features like course creation, section management, and lesson organization.

## 🚀 Features

- **Course Management**: Create and organize courses with rich content
- **Section Organization**: Structure your course into logical sections
- **Interactive Lessons**: Create and reorder lessons within sections
- **User Authentication**: Secure access control for educators and students
- **Responsive Design**: Works on desktop and mobile devices


## 🚀 Getting Started

### Prerequisites

- Node.js 20+ (LTS recommended)
- pnpm 10+
- Git

### Environment Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/aadi-thedevguy/learning-management-platform.git
   cd learning-management-platform
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory and add the required variables. (Reference : src/env.ts)

4. **Set up the database**
   ```bash
   npx drizzle-kit migrate dev --name init
   npx drizzle-kit generate
   ```

### Development

1. **Start the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   # or
   yarn dev
   ```

### Building for Production

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## 📁 Project Structure

```
lms-tanstack/
├── src/                    # Application code
│   ├── components/         # Reusable components
│   ├── routes/             # Application routes
│   └── lib/                # Utility functions
│   └── drizzle/            # Database schema and migrations
│   └── features/           # Feature-based code organization
├── public/                 # Static 
```

## 🤝 Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Made with ❤️ by [Aditya](https://adityakhare.com)
