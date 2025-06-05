# 📰 NewsHub: Your Personalized News Universe! 🌍

NewsHub is a cutting-edge news platform that redefines how you stay informed. Built with the MERN stack (MongoDB, Express.js, React, Node.js), styled with Tailwind CSS, and powered by Redux, NewsHub delivers real-time, personalized, and visually stunning news experiences. Dive into stories that matter to you, wherever you are! 🚀

## 🌟 Why Choose NewsHub?

- **Feeds** 🤖: News tailored to your interests.
- **Lightning-Fast Updates** ⚡️: Stay ahead with live global news.
- **Sleek UI** 🎨: Tailwind CSS for a responsive, modern design.
- **Smooth State Management** 🔄: Redux for seamless interactions.
- **Offline Access** 📖: Save articles for anytime reading.

## 🔥 Features

- Browse news by category: Tech, Sports, Business, and more.
- Instant search for quick article discovery.
- Bookmark and share stories with ease.
- Toggle dark/light modes for comfortable reading.
- Push notifications for breaking news alerts.

## 🛠️ Tech Stack

<p align="center">
  <img src="https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB" alt="Express.js"/>
  <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/redux-%23593d88.svg?style=for-the-badge&logo=redux&logoColor=white" alt="Redux"/>
</p>

- **MongoDB**: NoSQL database for scalable data storage.
- **Express.js**: Robust API framework for backend logic.
- **React**: Dynamic, component-driven frontend.
- **Node.js**: High-performance server for real-time updates.
- **Tailwind CSS**: Utility-first CSS for stunning visuals.
- **Redux**: Centralized state management for smooth UX.
- **Tools**: Git, VS Code, NewsAPI, Axios.

## 📬 Contact

Questions or ideas? Reach out!

- GitHub: [MdSaad09](https://github.com/MdSaad09)
- Email: mhdsaadkhan098@gmail.com

## 🙌 Acknowledgments

- Built with ❤️ by MdSaad09.
- Inspired by a passion for accessible, engaging news.



```
News
├─ client
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public
│  │  ├─ assets
│  │  │  └─ placeholder.png
│  │  └─ vite.svg
│  ├─ README.md
│  ├─ src
│  │  ├─ App.jsx
│  │  ├─ assets
│  │  │  └─ react.svg
│  │  ├─ components
│  │  │  ├─ advertisements
│  │  │  │  └─ AdDisplay.jsx
│  │  │  ├─ auth
│  │  │  │  ├─ AdminRoute.jsx
│  │  │  │  ├─ ProtectedRoute.jsx
│  │  │  │  └─ ReporterRoute.jsx
│  │  │  ├─ common
│  │  │  │  ├─ FormInput.jsx
│  │  │  │  ├─ NewsCard.jsx
│  │  │  │  ├─ PersonCard.jsx
│  │  │  │  └─ VideoPlayer.jsx
│  │  │  └─ layout
│  │  │     ├─ Footer.jsx
│  │  │     ├─ Header.jsx
│  │  │     └─ Layout.jsx
│  │  ├─ index.css
│  │  ├─ main.jsx
│  │  ├─ pages
│  │  │  ├─ admin
│  │  │  │  ├─ AdminDashboard.jsx
│  │  │  │  ├─ AdminHome.jsx
│  │  │  │  ├─ AdvertisementAnalytics.jsx
│  │  │  │  ├─ AdvertisementEditor.jsx
│  │  │  │  ├─ AdvertisementManagement.jsx
│  │  │  │  ├─ CategoryManagement.jsx
│  │  │  │  ├─ NewsEditor.jsx
│  │  │  │  ├─ NewsManagement.jsx
│  │  │  │  ├─ PageEditor.jsx
│  │  │  │  ├─ PageManagement.jsx
│  │  │  │  ├─ PeopleAnalytics.jsx
│  │  │  │  ├─ PeopleManagement.jsx
│  │  │  │  ├─ PersonEditor.jsx
│  │  │  │  ├─ ReporterApplications.jsx
│  │  │  │  ├─ ReporterManagement.jsx
│  │  │  │  ├─ SiteSettings.jsx
│  │  │  │  └─ UserManagement.jsx
│  │  │  ├─ HomePage.jsx
│  │  │  ├─ LoginPage.jsx
│  │  │  ├─ NewsDetailPage.jsx
│  │  │  ├─ NotFoundPage.jsx
│  │  │  ├─ PeopleListPage.jsx
│  │  │  ├─ PersonNewsPage.jsx
│  │  │  ├─ ProfilePage.jsx
│  │  │  ├─ RegisterPage.jsx
│  │  │  ├─ reporter
│  │  │  │  ├─ CreateNews.jsx
│  │  │  │  ├─ EditNews.jsx
│  │  │  │  ├─ ReporterDashboard.jsx
│  │  │  │  └─ ReporterStats.jsx
│  │  │  └─ VideoNewsPage.jsx
│  │  ├─ redux
│  │  │  ├─ slices
│  │  │  │  ├─ authSlice.js
│  │  │  │  ├─ categorySlice.js
│  │  │  │  ├─ newsSlice.js
│  │  │  │  └─ peopleSlice.js
│  │  │  ├─ store.js
│  │  │  └─ thunks
│  │  │     └─ authThunk.js
│  │  ├─ services
│  │  │  ├─ adminService.js
│  │  │  ├─ advertisementService.js
│  │  │  ├─ api.js
│  │  │  ├─ authService.js
│  │  │  ├─ categoryService.js
│  │  │  ├─ newsService.js
│  │  │  ├─ pageService.js
│  │  │  ├─ personService.js
│  │  │  ├─ settingsService.js
│  │  │  └─ userService.js
│  │  └─ utils
│  │     ├─ imageUtils.js
│  │     ├─ personDetection.js
│  │     └─ videoUtils.js
│  └─ vite.config.js
├─ News Website Project Context - Complete Reference.pdf
├─ package-lock.json
├─ package.json
├─ README.md
└─ server
   ├─ .env
   ├─ config
   │  └─ db.js
   ├─ controllers
   │  ├─ adminController.js
   │  ├─ advertisementController.js
   │  ├─ authController.js
   │  ├─ categoryController.js
   │  ├─ newsController.js
   │  ├─ pageController.js
   │  ├─ personController.js
   │  ├─ settingsController.js
   │  └─ userController.js
   ├─ middleware
   │  └─ authMiddleware.js
   ├─ models
   │  ├─ Advertisement.js
   │  ├─ Category.js
   │  ├─ Comment.js
   │  ├─ index.js
   │  ├─ News.js
   │  ├─ NewsPersons.js
   │  ├─ Page.js
   │  ├─ Person.js
   │  ├─ Settings.js
   │  └─ User.js
   ├─ package-lock.json
   ├─ package.json
   ├─ routes
   │  ├─ adminRoutes.js
   │  ├─ advertisementRoutes.js
   │  ├─ authRoutes.js
   │  ├─ categoryRoutes.js
   │  ├─ newsRoutes.js
   │  ├─ pageRoutes.js
   │  ├─ personRoutes.js
   │  ├─ settingsRoutes.js
   │  ├─ uploadRoutes.js
   │  └─ userRoutes.js
   ├─ server.js
   ├─ uploads
   │  ├─ images
   │  │  ├─ coverImage-1746700572864-947085685.jpeg
   │  │  ├─ coverImage-1746701640900-490117070.jpeg
   │  │  ├─ image-1748253053798-93415346.webp
   │  │  ├─ image-1748253213607-345112630.jpg
   │  │  ├─ image-1748253230809-474204837.jpg
   │  │  ├─ image-1748253716427-651414575.webp
   │  │  ├─ image-1748253732574-102811155.jpg
   │  │  ├─ image-1748256774793-277706076.jpeg
   │  │  ├─ image-1748258644693-692005881.webp
   │  │  ├─ image-1748341452530-612189857.webp
   │  │  ├─ image-1748343471310-413849294.jpg
   │  │  ├─ image-1748346547182-609582473.jpg
   │  │  ├─ image-1748349884941-140661457.jpg
   │  │  ├─ image-1748350089962-567812820.webp
   │  │  ├─ image-1748350473363-568649428.jpg
   │  │  ├─ image-1748350706089-130115562.jpeg
   │  │  └─ image-1748428862891-795116827.jpg
   │  ├─ people
   │  │  └─ 1748250773187-806193533.jpg
   │  ├─ temp
   │  │  ├─ 05092007737decf790210a3487044b73
   │  │  ├─ 0b25f5756e80f602e48b807e8dfffe35
   │  │  ├─ 0e3aa25a25b81095758513d5814134fb
   │  │  ├─ 15b9e9dce2e5cfd0e4641615f8c081d2
   │  │  ├─ 396a5db9ea54c9e379c5fcdad0fbeffc
   │  │  ├─ 98fc10448a821bdfc133804e9d95e605
   │  │  └─ cf7119881dd069b69c13e88db7edb0de
   │  ├─ thumbnails
   │  │  ├─ 1748256789478-61272132.jpg
   │  │  ├─ 1748258658443-98248882.jpg
   │  │  ├─ 1748258684440-962900372.jpg
   │  │  └─ 1748263173565-670890891.jpg
   │  └─ videos
   │     ├─ 1748256788994-672955235.mp4
   │     ├─ 1748258658246-949627555.mp4
   │     ├─ 1748258684289-175416085.mp4
   │     ├─ 1748263172970-681378467.mp4
   │     ├─ video-1748253230556-362474422.mp4
   │     └─ video-1748253732292-775614512.mp4
   └─ utils
      ├─ documentParser.js
      ├─ fileUpload.js
      └─ initDb.js

```
