# Rafflhub Frontend

This project is the frontend for the Rafflhub platform. It is built with React and provides a modern, multi-page user interface for creating, managing, and participating in on-chain raffles. The application features smart contract integration, responsive design, and a professional dark theme for an enhanced user experience.

Key features include:
- Multi-page architecture (Landing, Create Raffle, Profile, Raffle Detail, etc.)
- Real-time smart contract data and wallet integration
- Separate forms for prized and non-prized raffles
- Collection deployment and management tools
- Responsive and accessible UI/UX

For more information, see the code and comments in the repository.

## 🚀 Features

### **Multi-Page Architecture**
- **Landing Page**: Displays all raffles categorized by state (Active, Pending, Drawing, Completed, Ended)
- **Profile Page**: User activity management, created raffles, purchased tickets, and collection management
- **Create Raffle Page**: Separate forms for prized and non-prized raffles with conditional display
- **Individual Raffle Page**: Detailed raffle view with split layout for participation and winner display

### **Enhanced User Experience**
- **Horizontal Scrollable Sections**: Each raffle category can be scrolled horizontally as it gets populated
- **Dropdown Navigation**: Profile and Create Raffle options accessible from header dropdown
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Theme**: Professional dark theme applied by default

### **Smart Contract Integration**
- **Dynamic Contract Configuration**: Uses constants.js for centralized contract address management
- **Conditional Raffle Creation**: Queries RaffleManager to determine if prized raffles are enabled
- **Comprehensive Contract Support**: Full integration with all protocol contracts
- **Real-time Data**: Live updates for raffle states, ticket counts, and time remaining

### **Creator Management Tools**
- **Royalty Adjustment**: Modify collection royalties after deployment (ERC721/ERC1155)
- **Revenue Withdrawal**: Withdraw creator revenue from completed raffles
- **Raffle Management**: View, delete, and manage created raffles
- **Collection Deployment**: Deploy new ERC1155 prize collections

### **Advanced Raffle Features**
- **Prized vs Non-Prized Raffles**: Separate creation flows based on protocol settings
- **Mintable Workflow Support**: Hide Token ID field for mintable collections
- **Ticket Limit Enforcement**: Fetch and enforce per-raffle ticket limits
- **State-Based UI**: Different interfaces based on raffle state (pending, active, drawing, completed)

## 📁 Project Structure

```
src/
├── components/
│   ├── dashboards/          # Legacy dashboard components (Admin, Operator)
│   ├── wallet/              # Wallet connection components
│   ├── Layout.jsx           # Header with dropdown navigation
│   ├── RoyaltyAdjustmentComponent.jsx
│   └── CreatorRevenueWithdrawalComponent.jsx
├── contexts/
│   ├── WalletContext.jsx    # Wallet connection management
│   ├── ContractContext.jsx  # Smart contract interactions
│   └── ThemeContext.jsx     # Theme management
├── contracts/
│   ├── *.json              # Contract ABI files
│   └── contractABIs.js     # ABI exports
├── pages/
│   ├── LandingPage.jsx     # Main raffle discovery page
│   ├── ProfilePage.jsx     # User profile and activity
│   ├── CreateRafflePage.jsx # Raffle creation forms
│   └── RaffleDetailPage.jsx # Individual raffle view
├── constants.js            # Contract addresses and configuration
└── App.jsx                # Main app with routing
```

## 🛠 Installation & Setup

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Configure Contract Addresses**
   Update `src/constants.js` with your deployed contract addresses:
   ```javascript
   export const CONTRACT_ADDRESSES = {
     raffleManager: "0xYourRaffleManagerAddress",
     raffleDeployer: "0xYourRaffleDeployerAddress",
     revenueManager: "0xYourRevenueManagerAddress",
     nftFactory: "0xYourNFTFactoryAddress"
   };
   ```

3. **Start Development Server**
   ```bash
   pnpm run dev
   ```

4. **Build for Production**
   ```bash
   pnpm run build
   ```

## 🎯 Key Pages & Functionality

### **Landing Page (`/`)**
- Automatically fetches and displays all raffles
- Horizontal scrollable sections for each raffle state
- "View Raffle" buttons lead to individual raffle pages
- Connect wallet prompt for participation

### **Profile Page (`/profile`)**
- **Activity Tab**: Recent user activity and transaction history
- **Created Raffles Tab**: Manage created raffles, view revenue, delete eligible raffles
- **Purchased Tickets Tab**: View all purchased tickets and raffle participation
- **Manage Collections Tab**: Royalty adjustment and revenue withdrawal tools

### **Create Raffle Page (`/create-raffle`)**
- **Conditional Display**: Shows prized or non-prized forms based on protocol settings
- **Prized Raffle Form**: Create new collections or use existing ones
- **Mintable Workflow**: Automatically hides Token ID field when selected
- **ERC1155 Deployment**: Standalone collection deployment tool

### **Individual Raffle Page (`/raffle/:address`)**
- **Split Layout**: Left half for participation, right half for winners
- **Ticket Purchase**: Enforces limits and shows remaining tickets
- **Winner Display**: Shows winners based on raffle state
- **Real-time Updates**: Live countdown and state changes

## 🔧 Technical Improvements

### **Architecture Changes**
- ✅ Removed single-page dashboard navigation
- ✅ Implemented React Router for multi-page navigation
- ✅ Centralized contract address management
- ✅ Removed configuration panel in favor of constants file

### **Enhanced Forms**
- ✅ Separate prized/non-prized raffle creation
- ✅ Protocol-aware conditional display
- ✅ Improved validation and error handling
- ✅ Mintable workflow support

### **User Experience**
- ✅ Intuitive navigation with dropdown menu
- ✅ Horizontal scrolling for raffle categories
- ✅ Responsive design for all screen sizes
- ✅ Professional dark theme

### **Smart Contract Integration**
- ✅ Dynamic protocol configuration checking
- ✅ Comprehensive error handling
- ✅ Real-time data fetching
- ✅ Transaction state management

## 🎨 Design Features

- **Dark Theme**: Professional dark color scheme
- **Responsive Layout**: Mobile-first design approach
- **Smooth Animations**: Hover effects and transitions
- **Consistent Typography**: Clear hierarchy and readability
- **Accessible UI**: Proper contrast and keyboard navigation

## 🔐 Security & Best Practices

- **Input Validation**: All forms include proper validation
- **Error Handling**: Comprehensive error messages and fallbacks
- **State Management**: Proper React state and context usage
- **Contract Safety**: Safe contract interaction patterns

## 📱 Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Web3 wallet integration (MetaMask, WalletConnect, Coinbase Wallet)

## 🚀 Deployment Ready

The application is production-ready with:
- Optimized build process
- Clean code structure
- Comprehensive error handling
- Mobile responsiveness
- Professional UI/UX

---

**Note**: This is a complete transformation from the original single-page application to a modern, multi-page React application with enhanced user experience and functionality.

