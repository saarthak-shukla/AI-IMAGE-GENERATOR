import React, { useState, useRef } from 'react';
import './ImageGenerator.css';
import image from '../Assets/image1.avif';

const ImageGenerator = () => {
  const [imageUrl, setImageUrl] = useState("/");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const imageGenerator = async () => {
    if (inputRef.current.value === "") {
      setError("Please enter a description");
      return;
    }
    
    setLoading(true);
    
    const apiKey = "sk-5gjxiiYPZXIP9wmAmRypW5gX9xXgC5tArzwjRRptdMLXAH2g"; // Ensure this is from your .env

    let retries = 3; // Number of retries

    while (retries > 0) {
      let delay = 1000; // Initial delay in milliseconds for each retry
      try {
        const response = await fetch(
          'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              text_prompts: [
                {
                  text: inputRef.current.value,
                  weight: 1
                }
              ],
              cfg_scale: 7,
              height: 1024,
              width: 1024,
              steps: 30,
              samples: 1
            }),
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Invalid API key. Please check your Stability AI API key");
          } else if (response.status === 429) {
            throw new Error('Rate limit exceeded. Retrying...');
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }

        const responseData = await response.json();
        const generatedImage = responseData.artifacts[0];
        const base64Image = generatedImage.base64;
        setImageUrl(`data:image/png;base64,${base64Image}`);
        setLoading(false);
        return; // Exit the loop if successful

      } catch (error) {
        if (error.message === 'Rate limit exceeded. Retrying...') {
          retries -= 1;
          if (retries === 0) {
            setError("Too many requests. Please try again later.");
            setLoading(false);
            return;
          }
          await new Promise(resolve => setTimeout(resolve, delay)); // Wait before retrying
          delay *= 2; // Exponential backoff
        } else {
          console.error('Error generating image:', error);
          setError(error.message || "An error occurred while generating the image");
          setLoading(false);
          return;
        }
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      imageGenerator();
    }
  };

  return (
    <div className="image-generator">
      <div className="header">AI Image <span>Generator</span></div>
      <div className="slogan animate__animated animate__fadeInDown">Create what you can Imagine</div>

      <div className="img-loading">
        <div className={`image-container ${loading ? 'loading' : ''}`}>
          <img
            src={imageUrl === "/" ? image : imageUrl}
            alt="AI generated preview"
            className="ai-image"
            onError={() => {
              setError("Failed to load the generated image");
              setImageUrl("/");
            }}
          />
          {loading && (
            <div className="loading-spinner">
              <span></span>
            </div>
          )}
        </div>
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="search-box">
        <div className="input-wrapper">
          <input
            type="text"
            ref={inputRef}
            className="search-type"
            placeholder="Describe your AI generated image"
            disabled={loading}
            onKeyPress={handleKeyPress}
          />
          <button
            className="generate-btn"
            onClick={imageGenerator}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>
      <div className="features">
        <ul>
          <li>High-quality image generation</li>
          <li>Fast response time</li>
          <li>Multiple style options</li>
          <li>Press Enter to generate</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageGenerator;
