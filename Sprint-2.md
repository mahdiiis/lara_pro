**Context:**
I have an existing AI Quiz Generator application built using technologies you can check in the project files (FrontEnd and BackEnd folders) . Currently, it generates quizzes based on user text prompts.  

**The Goal:**
I want to add a new "Source Input" feature similar to Google AI Studio or ChatGPT, where users can provide external context for the AI to base the quiz on. 

Please help me implement two new input methods for the quiz generation:
1. **File Upload:** A button/drag-and-drop area to upload a document (PDF, TXT, DOCX).
2. **URL Link:** A text input field to paste a website link.

**Requirements & Step-by-Step Instructions:**

**1. Frontend UI Updates:**
* Create a clean, intuitive UI component that offers tabs or toggles between "Text Prompt", "Upload File", and "Paste Link".
* Add a file input component that accepts `.txt`, `.pdf`, and `.docx` files. Include a loading state while the file is being processed.
* Add an input field for the URL and a "Fetch/Process" button.
* Manage the state for the uploaded file/URL and pass this data to the backend API when the user clicks "Generate Quiz".

**2. Backend / Data Processing Updates:**
* **For URLs:** Write a function using a library like ** you choose based on the backend stack ** to fetch the webpage, strip away HTML tags/ads/navbars, and extract the main readable text.
* **For Files:** Write a function to parse text from the uploaded files. Suggest the best libraries to use for extracting text from PDFs and DOCX files in my backend stack.
* Implement error handling (e.g., "URL not accessible", "File size too large", "Unsupported file type").

**3. AI Integration:**
* Show me how to structure the prompt that gets sent to the AI. It should dynamically inject the extracted text from the file/link and instruct the AI to: *"Read the following source material and generate a [number]-question quiz based strictly on this content. Source material: {extracted_text}"* 

**4. Implementation Plan:**
Please provide the necessary code in a logical order:
1. Which new dependencies/libraries do I need to install?
2. The code for the Backend extraction logic (File parsing & Web scraping).
3. The updated AI API call.
4. The Frontend UI code to handle the inputs and state.

Please write clean, well-commented code and ensure it integrates smoothly into a standard **[Your Tech Stack]** architecture.

***

### Why this prompt works perfectly for Claude:
1. **Defines the Tech Stack:** By giving Claude your exact framework, it won't guess and give you Python code when you are using Node.js.
2. **Breaks down the logic:** Generating a quiz from a file isn't just one step. It requires *parsing* the file first, turning it into raw text, and *then* sending it to the AI. This prompt forces Claude to write the parsing logic for you.
3. **Prompt Engineering for the AI:** It tells Claude to write the specific "system prompt" that will instruct your quiz generator to stick strictly to the uploaded document, preventing the AI from making up random questions.