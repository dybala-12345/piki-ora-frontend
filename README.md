# Piki Ora Medical Centre – React Front End

React single-page app for the Piki Ora Medical Centre appointment system
(ISCG7420 Assignment 2). It uses the Django REST Framework API
(`piki-ora-api` repository) through axios.

## Tech stack

- React 19 with function components and hooks (`useState`, `useEffect`, `useContext`)
- React Router 7: layout routes with `<Outlet/>`, dynamic segments (`:id`), protected routes
- axios: one shared instance in `src/api.js` that adds the `Authorization: Token ...` header
- React-Bootstrap / Bootstrap 5 for a responsive UI
- Vite for development and building

## Structure

```
src/
  main.jsx                  BrowserRouter + AuthProvider
  App.jsx                   all routes
  api.js                    axios instance, token header, error messages
  format.js                 date/time helpers
  context/AuthContext.jsx   login / register / logout, current user
  components/
    Layout.jsx              navbar + footer around every page (<Outlet/>)
    Menu.jsx                responsive navbar (changes for patient / admin / guest)
    ProtectedRoute.jsx      blocks pages unless logged in (or admin)
    SlotPicker.jsx          pick a free slot for a doctor (reused 3 times)
    Loading.jsx
  pages/
    Home, Login, Register, Doctors, DoctorDetail (book),
    MyAppointments (view, cancel), EditAppointment (reschedule), Notifications
    admin/
      AdminLayout           dashboard side menu (nested routes)
      AdminHome             stats + today's schedule
      AdminAppointments     all bookings: filter, edit, cancel, book for a patient
      AdminDoctors          add / edit / remove doctors
      AdminSlots            add / delete slots, generate a schedule in bulk
      AdminPatients         add / edit / deactivate / delete patient accounts
```

## Run locally

```bash
npm install
copy .env.example .env      # Mac/Linux: cp .env.example .env
# set VITE_API_URL=http://127.0.0.1:8000 (the Django server)
npm run dev                 # opens http://localhost:5173
```

## Deploy on Render (Static Site)

- **Build command:** `npm install && npm run build`
- **Publish directory:** `dist`
- **Environment variable:** `VITE_API_URL=https://<your-api>.onrender.com`
- **Redirects/Rewrites:** Source `/*` → Destination `/index.html` → Action **Rewrite**
  (without it, refreshing a page like `/doctors/1` gives a 404)
