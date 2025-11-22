# 💊 PillPal - Smart Medication Management

> A comprehensive, intelligent medication tracking and management application designed to help users maintain medication adherence, track symptoms, and manage their health effectively.

## ✨ Features

### 📅 Core Medication Management
- **Smart Medicine Tracking**: Add, edit, and delete medications with detailed information
- **Flexible Scheduling**: Set multiple daily doses with custom times
- **Dose Tracking**: Mark doses as taken with timestamp tracking
- **Duration Management**: Set medication duration or mark as indefinite

### 🔔 Reminders & Notifications
- **Smart Reminders**: Configurable notification system for medication times
- **Refill Alerts**: Get notified when it's time to refill prescriptions
- **Customizable Timing**: Set reminder lead time (e.g., 30 minutes before dose)
- **Browser Notifications**: Native browser notification support

### 📊 Analytics & Insights
- **Adherence Tracking**: Visual analytics showing medication compliance
- **Adherence Score**: Calculate and display overall adherence percentage
- **Trend Analysis**: View adherence patterns over time with interactive charts
- **Dose History**: Complete history of all doses taken

### 🔍 Drug Information
- **Real-time Drug Search**: Search medications using RxNav API
- **Auto-complete Suggestions**: Get medicine suggestions as you type
- **Detailed Information**: View dosage forms, strengths, and manufacturer details
- **FDA Data Integration**: Access adverse event reports from FDA FAERS database

### ⚠️ Safety Features
- **Drug Interaction Checker**: Automatically check for potential drug interactions
- **Contraindications**: View and track medication contraindications
- **Side Effects Tracking**: Log and correlate symptoms with medications
- **Emergency Card**: Generate emergency medication information card

### 📱 Symptom Tracking
- **Symptom Logger**: Track symptoms and their severity
- **Correlation Analysis**: Identify potential medication-related symptoms
- **Severity Levels**: Categorize symptoms as mild, moderate, or severe
- **Notes Support**: Add detailed notes for each symptom entry

### 💾 Data Management
- **Local Storage**: All data stored securely in browser localStorage
- **Backup & Restore**: Export and import medication data as JSON
- **Auto-backup**: Automatic backup system with version history
- **PDF Export**: Generate PDF reports of medication schedules
- **Data Export**: Export data in JSON format for external use

### 🎨 User Experience
- **Modern UI**: Clean, intuitive interface built with Shadcn UI
- **Dark Mode Support**: Toggle between light and dark themes
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Smooth Animations**: Polished interactions with Framer Motion
- **Accessibility**: WCAG compliant with keyboard navigation support

### 🔍 Advanced Features
- **Medicine Condition Search**: Search for medicines by condition or symptom
- **QR Code Generation**: Generate QR codes for medication information
- **Multi-tag System**: Organize medications with custom tags
- **Search & Filter**: Quickly find medications with advanced filtering

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **Package Manager**: npm, yarn, or pnpm
- **Browser**: Modern browser with localStorage and notification support

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/smile-plzz/PillPal.git
   cd PillPal
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm start
```

## 📖 Usage Guide

### Adding a Medicine

1. Navigate to the **Dashboard** tab
2. Click **Add Medicine** button
3. Fill in the medicine details:
   - **Name**: Start typing to get autocomplete suggestions from RxNav
   - **Dosage**: Specify the dosage (e.g., "500mg")
   - **Times**: Add one or more daily dose times
   - **Duration**: Set duration in days or leave blank for indefinite
   - **Instructions**: Add special instructions (e.g., "Take with food")
   - **Notes**: Add any additional notes
4. Click **Save Medicine**

### Tracking Doses

1. Go to the **Schedule** tab
2. View your daily medication schedule
3. Click the checkbox next to each dose when taken
4. The system automatically timestamps each dose

### Viewing Analytics

1. Navigate to the **Analytics** tab
2. View your adherence score and trends
3. See detailed charts showing:
   - Overall adherence percentage
   - Daily adherence patterns
   - Missed doses
   - Adherence by medication

### Checking Drug Interactions

1. When adding a new medicine, interactions are automatically checked
2. View warnings if potential interactions are detected
3. Access the **Drug Interaction Checker** for detailed analysis

### Tracking Symptoms

1. Go to the **Symptoms** tab
2. Click **Log Symptom**
3. Select the medication and symptom
4. Set severity level (mild, moderate, severe)
5. Add optional notes
6. View correlations between symptoms and medications

### Backup & Restore

**Creating a Backup:**
1. Click the **Backup** button in the dashboard
2. A JSON file will be downloaded with all your data

**Restoring from Backup:**
1. Click the **Restore** button
2. Select your backup JSON file
3. Confirm the restoration

## 🛠️ Tech Stack

### Frontend Framework
- **Next.js 16.0.1**: React framework with App Router
- **React 19.2.0**: UI library
- **TypeScript 5.0**: Type-safe development

### Styling & UI
- **Tailwind CSS 4.1.9**: Utility-first CSS framework
- **Shadcn UI**: High-quality React components
- **Radix UI**: Accessible component primitives
- **Framer Motion 12.23.24**: Animation library
- **Lucide React**: Icon library

### State Management
- **React Context API**: Global state management
- **LocalStorage**: Client-side data persistence

### Data Visualization
- **Recharts**: Interactive charts and graphs
- **jsPDF**: PDF generation
- **QRCode**: QR code generation

### External APIs
- **RxNav API**: Drug information and suggestions
- **OpenFDA API**: FDA drug data and adverse events

### Development Tools
- **Jest**: Testing framework
- **Testing Library**: Component testing
- **ESLint**: Code linting
- **PostCSS**: CSS processing

## 📁 Project Structure

```
PillPal/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   └── medicine-details/     # Medicine details endpoint
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── ui/                       # Shadcn UI components
│   ├── adherence-analytics.tsx  # Analytics dashboard
│   ├── dashboard.tsx             # Main dashboard
│   ├── drug-interaction-checker.tsx
│   ├── emergency-card.tsx        # Emergency info card
│   ├── medicine-form.tsx         # Add/edit medicine form
│   ├── medicine-details-modal.tsx
│   ├── notification-system.tsx   # Notification handler
│   ├── schedule-table.tsx        # Daily schedule view
│   ├── symptom-tracker.tsx       # Symptom logging
│   └── ...
├── lib/                          # Utility libraries
│   ├── backup-utils.ts           # Backup/restore logic
│   ├── data-utils.ts             # Data export utilities
│   ├── medicine-api.ts           # API integration
│   ├── medicines-context.tsx     # Global state context
│   ├── reminders-utils.ts        # Notification logic
│   ├── symptom-utils.ts          # Symptom analysis
│   ├── types.ts                  # TypeScript types
│   └── use-medicines.ts          # Custom hook
├── __tests__/                    # Test files
├── public/                       # Static assets
├── .eslintrc.json               # ESLint config
├── next.config.mjs              # Next.js config
├── package.json                 # Dependencies
├── tailwind.config.ts           # Tailwind config
├── tsconfig.json                # TypeScript config
└── README.md                    # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Optional: Add custom API keys if needed
NEXT_PUBLIC_OPENFDA_API_KEY=your_api_key_here
```

### Browser Permissions

For full functionality, grant the following permissions:
- **Notifications**: Enable browser notifications for reminders
- **LocalStorage**: Required for data persistence

## 🧪 Testing

Run the test suite:

```bash
npm test
# or
npm run test:watch  # Watch mode
```

## 📊 Data Privacy

- **Local-First**: All data is stored locally in your browser
- **No Server Storage**: No medication data is sent to external servers
- **API Calls**: Only medicine names are sent to RxNav/OpenFDA for information lookup
- **Export Control**: You control all data exports and backups

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Md. Ismail Hossain**
- GitHub: [@smile-plzz](https://github.com/smile-plzz)

## 🙏 Acknowledgments

- [RxNav API](https://rxnav.nlm.nih.gov/) for drug information
- [OpenFDA](https://open.fda.gov/) for FDA data
- [Shadcn UI](https://ui.shadcn.com/) for beautiful components
- [Vercel](https://vercel.com) for hosting

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on [GitHub Issues](https://github.com/smile-plzz/PillPal/issues)
- Check the [documentation](https://github.com/smile-plzz/PillPal/wiki)

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Cloud sync with end-to-end encryption
- [ ] Multi-user support for caregivers
- [ ] Integration with pharmacy APIs
- [ ] Voice reminders
- [ ] Apple Health / Google Fit integration
- [ ] Medication image recognition
- [ ] Multi-language support

---

**⚠️ Medical Disclaimer**: PillPal is a medication tracking tool and should not replace professional medical advice. Always consult with healthcare professionals regarding your medications and health conditions.
