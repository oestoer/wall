# 🏠 Wall Line Calculator & Visualizer

A web application designed to help you calculate and visualize vertical or horizontal line patterns on walls. Perfect for planning decorative wall treatments like wallpaper, paint stripes, or paneling.

![Wall Line Calculator](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Demo

Try it out at [Wall Line Calculator](https://oestoer.github.io/wall/).

## 📋 What This Project Is

The Wall Line Calculator & Visualizer is an interactive tool that allows you to:
- Plan and visualize wall line patterns before implementation
- Calculate optimal line configurations based on your wall dimensions
- Customize colors and patterns in real-time
- Account for obstacles like wardrobes, doors, and windows
- Save and manage multiple room configurations

## ✨ Key Features

### Core Functionality
- 📏 **Wall Dimensions** - Input custom wall length and height (in centimeters)
- 📐 **Line Configuration** - Configure line thickness, ratio, and direction (vertical/horizontal)
- 🎨 **Color Customization** - Choose custom colors for both colored and white lines
- 🔄 **Real-time Preview** - See your wall design update instantly as you make changes

### Advanced Features
- 🚪 **Wardrobe/Door Placement** - Add and position wardrobes or doors with custom dimensions
- 🪟 **Window Placement** - Include windows with adjustable size and position
- 💾 **Room Configuration Saving** - Save up to 10 different room configurations
- 🌓 **Theme Support** - Toggle between light, dark, and auto (system) themes
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- [Yarn](https://yarnpkg.com/) (Version 4+)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/oestoer/wall.git
   cd wall
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Start the development server**
   ```bash
   yarn dev
   ```
   Open `http://localhost:5173` in your browser.

### Building for Production

To create a production-ready build:

```bash
yarn build
```

To preview the production build locally:

```bash
yarn preview
```

### Basic Workflow

1. **Enter Wall Dimensions**
   - Input your wall length and height in centimeters
   
2. **Configure Lines**
   - Set minimum and maximum line thickness
   - Choose the ratio between colored and white lines
   - Select your desired line configuration from the dropdown
   - Pick vertical or horizontal orientation

3. **Customize Colors**
   - Click the color pickers to choose your preferred colors
   - See the preview update in real-time

4. **Add Obstacles (Optional)**
   - Toggle on wardrobe/door or window options
   - Configure their dimensions and positions

5. **Save Your Configuration**
   - Open the menu (hamburger icon in top-right)
   - Enter a room name and click "Save"
   - Load saved configurations anytime by clicking on them

## 📁 Project Structure

```
wall/
├── css/                    # Global styles
│   └── styles.css
├── components/             # Web Components
│   └── color-picker.ts     # Custom color picker implementation
├── js/                     # Application Logic (TypeScript)
│   ├── app.ts              # Main entry point
│   ├── ui-manager.ts       # UI coordination
│   ├── wall-model.ts       # Calculation logic
│   ├── visualizer.ts       # Rendering logic
│   ├── theme.ts            # Theme management
│   ├── storage.ts          # LocalStorage handlers
│   └── utils.ts            # Utility functions
├── index.html              # Main HTML entry point
├── package.json            # Dependencies and scripts (Yarn Berry)
├── tsconfig.json           # TypeScript configuration
└── vite.config.js          # Vite configuration (optional/auto)
```

## 🔧 Technical Details

### Built With
- **TypeScript** - Static typing for robust code
- **Vite** - Fast development server and bundler
- **Yarn Berry** - Modern package management
- **Vanilla JavaScript/DOM** - Lightweight, no framework overhead
- **Web Components** - Custom encapsulated elements
- **CSS3** - Responsive styling with Variables

### Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 💡 Tips & Tricks

1. **Line Configuration** - The dropdown automatically updates based on your min/max thickness settings
2. **Ratio Explained** - A ratio of 1 means equal widths, 0.5 means colored lines are half the width of white lines, 2 means colored lines are twice as wide
3. **Responsive Preview** - The wall visualization automatically scales to fit your screen
4. **Keyboard Navigation** - Use Tab to navigate through form fields efficiently
5. **Save Often** - Save different configurations to compare design options

## 🐛 Known Issues

- Maximum of 10 saved room configurations (localStorage)
- Very large wall dimensions may affect visualization scaling on small screens

## 🗺️ Roadmap

- [ ] Export designs as PNG/PDF
- [ ] Import/Export room configurations as JSON
- [ ] Unit conversion (cm ↔ inches ↔ meters)
- [ ] Material cost calculator
- [ ] Multiple wall support (entire room)
- [ ] Undo/Redo functionality

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

---

**Enjoy planning your perfect wall design!** 🎨✨
