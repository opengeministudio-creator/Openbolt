# AI Code Builder

An open source, local-first version of bolt.new / lovable.dev / v0.app - build web applications using AI assistance with a live preview.

## Features

- **Local-First Architecture**: All data stored in IndexedDB for offline access
- **AI-Powered Code Generation**: Uses Claude AI to generate and modify code based on natural language
- **Live Preview**: See your changes in real-time with a sandboxed iframe
- **Code Editor**: Edit HTML, CSS, and JavaScript files directly
- **File Management**: Browse and manage your project files with a tree view
- **Chat Interface**: Conversational AI assistant to help you build
- **Optional Cloud Sync**: Sync projects to Supabase (optional)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Your API Key

1. Get an Anthropic API key from [console.anthropic.com](https://console.anthropic.com/)
2. Click the Settings icon in the app and enter your API key
3. Your key is stored locally in your browser

### 3. Run the Development Server

```bash
npm run dev
```

### 4. Start Building

- Type what you want to build in the chat
- The AI will generate the code for you
- See the live preview update automatically
- Edit the code directly if needed

## Optional: Supabase Integration

To enable cloud syncing and multi-device access:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/001_initial_schema.sql`
3. Copy your Supabase URL and anon key
4. Update `.env` with your credentials:
   ```
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key
   ```

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Local Storage**: IndexedDB
- **AI**: Anthropic Claude API
- **Optional Backend**: Supabase (PostgreSQL + Auth)

## How It Works

1. **Local-First**: Projects are automatically saved to your browser's IndexedDB
2. **AI Generation**: When you chat, your message and current files are sent to Claude
3. **Code Parsing**: The AI response is parsed for code blocks with filenames
4. **File Updates**: Files are automatically created or updated based on AI output
5. **Live Preview**: Changes are rendered in a sandboxed iframe
6. **Manual Editing**: You can also edit files directly in the code editor

## Privacy

- Your API key is stored only in your browser's localStorage
- Projects are stored locally in IndexedDB
- No data is sent to any server except:
  - Anthropic API (for AI generation)
  - Supabase (if configured, for optional sync)

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## License

MIT - feel free to use this for any purpose!

## Contributing

Contributions welcome! This is an open source project.

## Acknowledgments

Inspired by bolt.new, lovable.dev, and v0.app - but fully open source and local-first.
