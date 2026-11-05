# AURORA 2026 • School of Nursing Freshers' Party Portal
### GIET University, Gunupur (Odisha)

A complete, mobile-responsive interactive web application and wall poster QR code system for the **School of Nursing Freshers' Party (AURORA 2026)**.

---

## 🌟 What This Project Includes

1. **Student Registration Web Experience (`index.html`)**:
   - **Page 1**: Header *"Welcome buddy"* with animated crown & golden sparkles + **Start** button.
   - **Page 2**: *"What is your name junior? 🎓"* with name input & validation + **Continue** button.
   - **Page 3**: *"What is your roll no.? 🔢"* with roll number input & validation + **Continue** button.
   - **Page 4**: *"What would you like to eat? 🍽️"* with **Veg** (🥗) & **Non-Veg** (🍗) interactive cards + **Continue** button.
   - **Page 5**: Grand reveal of the **Official Freshers' Party Poster** with:
     - Confetti explosion & celebratory chime sound!
     - Personalized **VIP Entry Pass** with the junior's name, roll no, and food choice.
     - One-click **Download VIP Pass** (generates a customized graphic ticket).
     - **Share on WhatsApp** with pre-filled event invitation.
     - **Add to Google Calendar** for 6th Nov 2026, 10:00 AM at Mechanical Auditorium.
     - Full-screen tap-to-zoom for the official poster.

2. **Building Wall QR Code & Printable Notice (`qr-poster.html`)**:
   - Generates high-definition QR codes ready to print and paste on nursing building walls.
   - Features an **A4 Printable Notice** pre-formatted with:
     - GIET University Gunupur & School of Nursing branding
     - Large crisp QR Code with "Scan with Mobile Camera" instructions
     - 3-step guide for juniors to scan and claim their VIP pass
     - One-click **Print Notice (A4)** button!

3. **Organizer & Catering Dashboard (`admin.html`)**:
   - Real-time attendee counter
   - **Veg vs Non-Veg breakdown** (so the food committee orders the exact right amount of lunch!)
   - Searchable table of registered students
   - One-click **Export to Excel / CSV**
   - Printable guest check-in sheet for the entrance desk on party day

---

## 🚀 How to Use

### 1. Instant Local Testing (Right Now on Your PC)
- Double-click **`index.html`** in your browser (Chrome, Edge, Firefox).
- Click **Start** and test the flow!

### 2. How to Paste the QR Code on Nursing Building Walls
1. Open **`qr-poster.html`** in your browser.
2. Put your website link in the URL box (or host it free online, see below).
3. Click **🖨️ Print Wall Notice (A4 Sheet)**.
4. Print 10–20 copies and paste them near nursing classrooms, notice boards, and building entrances!
5. When any student points their phone camera or Google Lens at the wall, it immediately opens the website!

---

## 🌐 Free 1-Minute Online Hosting (So Mobile Phones Can Scan It)

To let students scan the QR code from their mobile phones anywhere on campus:

### Option A: Netlify Drop (Easiest — Takes 30 Seconds, No Terminal Needed)
1. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag and drop the `fresher` folder directly into the browser.
3. Netlify will give you a free live URL (e.g. `https://giet-nursing-aurora2026.netlify.app`).
4. Paste that link into `qr-poster.html`, print your posters, and you're ready!

### Option B: GitHub Pages
1. Push this folder to a GitHub repository.
2. Go to **Settings** > **Pages** > Set source to `main` branch.
3. Your site is live at `https://<username>.github.io/<repo-name>/`.

---

## 📁 File Structure

```
fresher/
├── index.html          # Student registration & poster reveal flow (Pages 1 to 5)
├── style.css           # Royal navy & shimmering gold stylesheet
├── app.js              # State machine, sound synthesizers, ticket generator
├── qr-poster.html      # QR generator & A4 printable wall notices
├── admin.html          # Organizer guest list & Veg/Non-Veg catering counts
├── assets/
│   ├── poster.jpg      # Official AURORA 2026 Freshers' Party poster
│   ├── qrcode.min.js   # Offline-ready QRCode generator library
│   └── confetti.js     # Particle celebration engine
└── README.md           # Documentation & guides
```

---
*Created for School of Nursing, GIET University, Gunupur • AURORA 2026*
