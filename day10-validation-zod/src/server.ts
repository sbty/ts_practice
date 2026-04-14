import app from './app.js';

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`------------------------------------------`);
    console.log(`🌐 Validated Todo API is running at http://localhost:${PORT}`);
    console.log(`------------------------------------------`);
});
