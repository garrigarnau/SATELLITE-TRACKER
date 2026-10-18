# SATELLITE-TRACKER

## About the Project

**SATELLITE-TRACKER** is a simple web application built to track satellites, visualize their orbits, and provide information such as visibility and orbital details. This project was created as a **learning exercise** to explore the fundamentals of **React** and **JavaScript** while experimenting with integrating third-party APIs.

By working on this project, I aimed to learn more about:

- Building interactive components with **React**.
- Consuming APIs in real-time.
- Enhancing UI/UX design for web applications.

This is not a production-ready application but a fun and educational project.

---

## Features

- **Satellite List:** Browse satellites visible from a specific location.
- **Visual Passes:** Find out when satellites are visible in the sky.
- **Orbit Visualization:** View the satellite's path around Earth.
- **Simple and Clear UI:** Built with beginner-friendly components and responsive design.

---

## Screenshots

![image](https://github.com/user-attachments/assets/304e3578-a72c-4f67-be84-87f00eee14f4)
![image](https://github.com/user-attachments/assets/b7bd12b9-7ea0-4f8b-a35f-5d0023663146)
![image](https://github.com/user-attachments/assets/e15db2e6-4220-4edc-b368-1c424d0a5540)
![image](https://github.com/user-attachments/assets/3621bb88-f0c8-47c8-86b0-b29efcf4cdee)
![image](https://github.com/user-attachments/assets/e6eea6f8-b3a0-4c37-be95-ef376fa4ffbd)




---

## Built With

- **Frontend:** React 18, Vite, React Router, Leaflet
- **Orbits:** [satellite.js](https://github.com/shashwatak/satellite-js) computes live positions and sky paths in the browser
- **APIs:** [N2YO](https://www.n2yo.com/) for passes and what's overhead, [OpenCage](https://opencagedata.com/) for city search
- **Deployment:** Docker (nginx) on Dokploy, at [satellitetracker.arnaugarriga.com](https://satellitetracker.arnaugarriga.com)

---

## Getting Started

The app lives in `satellite-tracker/`.

```bash
cd satellite-tracker
npm install
```

Create `satellite-tracker/.env.local` with your keys. The dev server's proxy adds them to API calls, so they never reach the browser:

```bash
N2YO_API_KEY=your-n2yo-key
OPENCAGE_API_KEY=your-opencage-key
```

```bash
npm run dev
```

## Production

`satellite-tracker/Dockerfile` builds the app and serves it with nginx. Pass `N2YO_API_KEY` and `OPENCAGE_API_KEY` as **runtime** environment variables. nginx adds them to `/api/*` requests and caches responses briefly to save API quota.

```bash
docker build -t satellite-tracker satellite-tracker
docker run -p 8080:80 -e N2YO_API_KEY=... -e OPENCAGE_API_KEY=... satellite-tracker
```
