# Report.AI - AI-Powered Technical Report Generator

Report.AI is a powerful web application that leverages Google's Gemini AI to generate professional technical reports complete with AI-generated images, making it easy to create comprehensive documents on any topic.

![Report.AI Screenshot](https://via.placeholder.com/800x450/1a365d/ffffff?text=Report.AI+Screenshot)

## Features

- **AI-Generated Content**: Utilizes Google's Gemini AI to create high-quality technical reports
- **AI-Generated Images**: Integrates with Gemini's image generation model to create relevant visuals
- **Multiple Report Styles**: Choose from professional, academic, or casual report styles
- **Customizable Length**: Set the desired report length from very short to extensive
- **Image & Graph Support**: Include AI-generated images and graph placeholders
- **Export Options**: Download reports as PDF or Markdown files
- **Report History**: Save and manage previously generated reports

## Technology Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: TailwindCSS with typography plugin
- **PDF Generation**: @react-pdf/renderer
- **Markdown Rendering**: react-markdown with remark-gfm
- **AI Integration**: Google Generative AI (Gemini)

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Google Gemini API key

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/SupratimRK/REport.AI.git
   cd REport.AI
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Using Gemini for Image Generation

This project uses Google's Gemini 2.0 Flash Preview model for AI image generation. To enable this feature:

1. Make sure your Gemini API key has access to the image generation models
2. The application will automatically use the `gemini-2.0-flash-preview-image-generation` model when generating images

For more information about Gemini's image generation capabilities, visit:
[https://ai.google.dev/gemini-api/docs/image-generation](https://ai.google.dev/gemini-api/docs/image-generation)

## License

This project is licensed under the MIT License.

## Acknowledgments

- Google's Generative AI team for providing the Gemini API
- The React and Vite communities for their excellent tools
- TailwindCSS for the styling framework
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
