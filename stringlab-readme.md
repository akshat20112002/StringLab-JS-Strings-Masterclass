# StringLab — JS Strings Masterclass

An interactive, single-file web application that provides a comprehensive hands-on tutorial for JavaScript string manipulation. Learn everything from basic string operations to advanced Unicode handling, regex patterns, and performance optimization — all in one place.

## 🚀 Features

### **Interactive String Editor**
- Real-time string manipulation with a built-in text editor
- Live preview of transformations without modifying the original input
- One-click apply functionality to replace input with transformed results

### **Comprehensive String Analysis**
- **UTF-16 length** vs **code points** vs **grapheme clusters**
- Character-by-character breakdown with Unicode code points
- UTF-8 byte count calculation
- Word and line counting

### **String Transformations**
- Case transformations (upper, lower, title, swap case)
- String slicing with `slice()`, `substring()`, and `substr()`
- Text trimming and whitespace collapsing
- String repetition and padding operations

### **Advanced Regex & Pattern Matching**
- Interactive find and replace with regex support
- Live highlighting of search patterns
- Capture group replacement with `$1`, `$2`, etc.
- Auto-linkification of @mentions and #hashtags

### **Unicode & Emoji Support**
- Proper handling of emojis, skin tones, and family emojis
- Combining character sequences (accents, diacritics)
- Code point visualization and analysis
- Grapheme cluster counting using `Intl.Segmenter`

### **Encoding & Decoding**
- Base64 encoding/decoding with proper Unicode support
- UTF-8 byte representation
- HTML entity escaping

### **Template Literals & Interpolation**
- Safe variable interpolation from JSON objects
- Tagged template demonstration with HTML escaping
- `String.raw` examples

### **Utility Functions**
- URL-friendly slug generation
- HTML escaping for safe output
- String padding with custom characters
- Text normalization and cleanup

### **Performance Testing**
- String concatenation vs array join benchmarking
- Real-time performance measurement
- Scalable test sizes

## 🎯 Educational Objectives

This project is designed to teach:

- **String Fundamentals**: Understanding JavaScript's string type and immutability
- **Unicode Complexities**: Difference between UTF-16 code units, code points, and grapheme clusters
- **Regex Mastery**: Pattern matching, flags, and capture groups
- **Performance Awareness**: Efficient string building techniques
- **Real-world Applications**: Common string utilities used in web development
- **Edge Cases**: Proper handling of emojis, accented characters, and international text

## 🛠 Getting Started

### **Installation**
1. Save the HTML file as `index.html`
2. Save the CSS file as `string_project.css`  
3. Save the JavaScript file as `string_project.js`
4. Double-click `index.html` to open in your browser

**No server required!** This is a completely self-contained, client-side application.

### **Usage**
1. **Start with the sample text** or load one of the presets (Short, Emoji-heavy, Accented, URL)
2. **Explore transformations** using the buttons in the left panel
3. **Try the interactive features** in the right panel cards
4. **Experiment with edge cases** like emojis, accented characters, and complex Unicode sequences

## 📋 Key Learning Areas

### **Beginner Level**
- String creation and basic operations
- Length calculation and character access
- Simple transformations (upper/lower case)
- Basic slicing and substring operations

### **Intermediate Level**
- Regular expressions and pattern matching
- String replacement with capture groups
- Template literals and interpolation
- HTML escaping and utility functions

### **Advanced Level**
- Unicode normalization and grapheme clusters
- Performance optimization techniques
- Complex regex patterns
- Encoding/decoding operations
- Tagged template literals

## 🧪 Interactive Examples

The application includes several preset examples to demonstrate edge cases:

- **Short**: Basic text for quick testing
- **Emoji-heavy**: Complex emoji sequences with skin tones and families
- **Accented & Combining**: Characters with diacritics and combining marks
- **URL & Mentions**: Real-world text with URLs, mentions, and hashtags

## 🎨 Technical Highlights

- **Modern JavaScript**: Uses ES6+ features with graceful fallbacks
- **Unicode-aware**: Proper handling of international text and emojis
- **Performance-focused**: Demonstrates efficient string manipulation techniques
- **Accessibility**: Clean, readable interface with semantic HTML
- **No Dependencies**: Pure vanilla JavaScript, CSS, and HTML

## 🔍 Perfect For

- **JavaScript learners** wanting to master string manipulation
- **Interview preparation** for frontend development roles
- **Educators** teaching JavaScript fundamentals
- **Developers** needing a reference for string operations
- **Anyone** curious about Unicode and text processing

## 🌟 Advanced Features

- Real-time character encoding analysis
- Interactive regex testing with live preview
- Performance benchmarking tools
- Unicode normalization examples
- Template literal security demonstrations

---

**Made for learning strings thoroughly. Try the buttons, inspect the code, and modify to test edge cases.** 🔍