# portfolioMangerTelegramBot
🤖 Telegram Portfolio Manager Bot
Telegram Portfolio Manager is a specialized admin panel built as a Telegram bot, designed to provide full content management for my personal portfolio website. It allows the owner to add, update, and manage projects in real-time without touching code or using heavy third-party CMS platforms.

🚀 Key Features
Effortless Content Management: Add, edit, or delete portfolio projects directly through a chat interface.

Media Automation: Integrated with Cloudinary API for instant image uploads and optimized delivery.

Database Synchronization: Automatic persistence of project metadata using MongoDB.

Secure Access: Administrative functions are restricted via User ID validation to ensure only the owner can modify content.

User-Friendly UX: Utilizes Custom Keyboards and Inline Buttons for fast and intuitive navigation.

🛠 Tech Stack
Runtime: Node.js

Framework: Telegraf.js (Telegram Bot API)

Database: MongoDB & Mongoose ORM

Cloud Storage: Cloudinary SDK

Deployment: Render (Backend)

🏗 Architecture & Workflow
Input: The admin sends a project photo and description to the bot.

Processing: The bot uploads the image to Cloudinary and retrieves a secure URL.

Persistence: The project data (title, description, links, and image URL) is saved to MongoDB.

Delivery: The Portfolio Frontend (React/Next.js) fetches the updated data via API calls to the Render-hosted backend.

📦 Installation & Setup
Clone the repository:

Bash
git clone https://github.com/YaroslavHuryk/portfolioMangerTelegramBot.git
Install dependencies:

Bash
npm install
Configure Environment Variables:
Create a .env file in the root directory:

Фрагмент коду
BOT_TOKEN=your_telegram_bot_token
MONGO_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ADMIN_ID=your_telegram_user_id
Run the application:

Bash
npm start
