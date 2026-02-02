/**
 * Plan-Craft v5.0 Image Pipeline
 * 
 * Purpose: Integrate RAG-based image generation for documentation
 * - Search relevant images from web
 * - Analyze image context and relevance
 * - Generate custom images when needed
 * - Manage image assets for document embedding
 */

export class ImagePipeline {
  constructor(ragSystem) {
    this.ragSystem = ragSystem; // RAGSystem instance
    this.images = [];
    this.imageCache = new Map();
    this.generationQueue = [];
  }

  /**
   * Search and collect relevant images for a section
   */
  async searchImagesForSection(sectionTitle, sectionContent, count = 3) {
    console.log(`[ImagePipeline] Searching images for: ${sectionTitle}`);

    try {
      // Extract keywords from section content
      const keywords = this.extractKeywords(sectionTitle, sectionContent);
      
      // Search images using RAG system
      const searchResults = await this.ragSystem.searchImages(keywords.join(' '), count);
      
      // Analyze each image for relevance
      const analyzedImages = [];
      for (const result of searchResults) {
        const analysis = await this.ragSystem.analyzeImage(result.url, sectionContent);
        
        if (analysis.relevanceScore > 0.7) {
          analyzedImages.push({
            url: result.url,
            caption: result.title || 'Relevant image',
            source: result.source || 'Web search',
            relevanceScore: analysis.relevanceScore,
            analysis: analysis.description,
            sectionId: sectionTitle
          });
        }
      }

      // Cache images
      this.images.push(...analyzedImages);
      analyzedImages.forEach(img => {
        this.imageCache.set(img.url, img);
      });

      console.log(`[ImagePipeline] Found ${analyzedImages.length} relevant images`);
      return analyzedImages;

    } catch (error) {
      console.error('[ImagePipeline] Error searching images:', error);
      return [];
    }
  }

  /**
   * Generate custom image for specific content
   */
  async generateCustomImage(prompt, sectionId, aspectRatio = '16:9') {
    console.log(`[ImagePipeline] Generating custom image for: ${sectionId}`);

    try {
      // Add to generation queue
      this.generationQueue.push({
        prompt,
        sectionId,
        aspectRatio,
        status: 'pending'
      });

      // Generate image using RAG system
      const generatedImage = await this.ragSystem.generateImage(
        prompt,
        aspectRatio,
        'recraft-v3' // High-quality model for professional images
      );

      // Update queue status
      const queueItem = this.generationQueue.find(
        q => q.sectionId === sectionId && q.prompt === prompt
      );
      if (queueItem) {
        queueItem.status = 'completed';
        queueItem.url = generatedImage.url;
      }

      // Add to images collection
      const customImage = {
        url: generatedImage.url,
        caption: `Generated: ${prompt}`,
        source: 'AI Generated',
        type: 'custom',
        sectionId,
        aspectRatio,
        generatedAt: new Date()
      };

      this.images.push(customImage);
      this.imageCache.set(generatedImage.url, customImage);

      console.log(`[ImagePipeline] Custom image generated successfully`);
      return customImage;

    } catch (error) {
      console.error('[ImagePipeline] Error generating image:', error);
      
      // Update queue status
      const queueItem = this.generationQueue.find(
        q => q.sectionId === sectionId && q.prompt === prompt
      );
      if (queueItem) {
        queueItem.status = 'failed';
        queueItem.error = error.message;
      }

      return null;
    }
  }

  /**
   * Generate hero image for first page
   */
  async generateHeroImage(projectName, projectType) {
    console.log('[ImagePipeline] Generating hero image...');

    const heroPrompts = {
      technical: `Professional technical documentation cover image for ${projectName}, 
                  modern digital illustration, clean design, technology theme, 
                  gradients of purple and blue, minimalist style, high quality`,
      business: `Professional business report cover image for ${projectName}, 
                 corporate style, charts and graphs, clean layout, 
                 professional color scheme, modern design, high quality`,
      development: `Software development project cover image for ${projectName}, 
                    code and architecture theme, modern tech aesthetic, 
                    clean and professional, vibrant colors, high quality`
    };

    const prompt = heroPrompts[projectType] || heroPrompts.technical;
    
    return await this.generateCustomImage(prompt, 'hero-image', '16:9');
  }

  /**
   * Generate architecture diagram as image (alternative to Mermaid)
   */
  async generateArchitectureImage(architectureDescription) {
    console.log('[ImagePipeline] Generating architecture diagram image...');

    const prompt = `System architecture diagram: ${architectureDescription}, 
                    clean technical diagram, labeled components, 
                    professional style, clear connections, white background`;

    return await this.generateCustomImage(prompt, 'architecture-diagram', '16:9');
  }

  /**
   * Generate workflow illustration
   */
  async generateWorkflowImage(workflowSteps) {
    console.log('[ImagePipeline] Generating workflow illustration...');

    const prompt = `Workflow illustration showing: ${workflowSteps}, 
                    step-by-step process diagram, modern flat design, 
                    arrows and connections, professional colors, clean layout`;

    return await this.generateCustomImage(prompt, 'workflow-diagram', '16:9');
  }

  /**
   * Extract keywords from content for image search
   */
  extractKeywords(title, content) {
    // Remove common words
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
      '의', '은', '는', '이', '가', '을', '를', '에', '와', '과', '도'
    ]);

    // Combine title and content
    const text = (title + ' ' + content).toLowerCase();
    
    // Extract words (both English and Korean)
    const words = text.match(/[\w가-힣]+/g) || [];
    
    // Filter and deduplicate
    const keywords = [...new Set(
      words
        .filter(w => w.length > 2 && !commonWords.has(w))
        .slice(0, 10) // Top 10 keywords
    )];

    return keywords;
  }

  /**
   * Get images by section ID
   */
  getImagesBySection(sectionId) {
    return this.images.filter(img => img.sectionId === sectionId);
  }

  /**
   * Get all images
   */
  getAllImages() {
    return this.images;
  }

  /**
   * Get generation queue status
   */
  getQueueStatus() {
    return {
      total: this.generationQueue.length,
      pending: this.generationQueue.filter(q => q.status === 'pending').length,
      completed: this.generationQueue.filter(q => q.status === 'completed').length,
      failed: this.generationQueue.filter(q => q.status === 'failed').length,
      queue: this.generationQueue
    };
  }

  /**
   * Optimize images for web (compression, resizing)
   */
  async optimizeImage(imageUrl, maxWidth = 1200) {
    console.log('[ImagePipeline] Optimizing image:', imageUrl);

    // Check cache first
    if (this.imageCache.has(imageUrl + '_optimized')) {
      return this.imageCache.get(imageUrl + '_optimized');
    }

    try {
      // In a real implementation, you would:
      // 1. Fetch the image
      // 2. Resize to maxWidth while maintaining aspect ratio
      // 3. Compress to reduce file size
      // 4. Convert to WebP format for better compression
      
      // For now, return original URL
      // TODO: Implement actual optimization using Canvas API or server-side service
      
      const optimized = {
        original: imageUrl,
        optimized: imageUrl, // Replace with optimized URL
        width: maxWidth,
        format: 'webp',
        optimizedAt: new Date()
      };

      this.imageCache.set(imageUrl + '_optimized', optimized);
      return optimized;

    } catch (error) {
      console.error('[ImagePipeline] Error optimizing image:', error);
      return { original: imageUrl, optimized: imageUrl };
    }
  }

  /**
   * Download image to local storage (for offline PDF generation)
   */
  async downloadImage(imageUrl) {
    console.log('[ImagePipeline] Downloading image:', imageUrl);

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const base64 = await this.blobToBase64(blob);
      
      return {
        url: imageUrl,
        blob,
        base64,
        mimeType: blob.type,
        size: blob.size
      };

    } catch (error) {
      console.error('[ImagePipeline] Error downloading image:', error);
      return null;
    }
  }

  /**
   * Convert blob to base64 for embedding
   */
  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Batch process images for document
   */
  async batchProcessImages(images, options = {}) {
    console.log(`[ImagePipeline] Batch processing ${images.length} images...`);

    const {
      optimize = true,
      download = false,
      maxWidth = 1200
    } = options;

    const processed = [];

    for (const image of images) {
      try {
        let processedImage = { ...image };

        if (optimize) {
          const optimized = await this.optimizeImage(image.url, maxWidth);
          processedImage.optimizedUrl = optimized.optimized;
        }

        if (download) {
          const downloaded = await this.downloadImage(image.url);
          if (downloaded) {
            processedImage.base64 = downloaded.base64;
            processedImage.mimeType = downloaded.mimeType;
          }
        }

        processed.push(processedImage);

      } catch (error) {
        console.error('[ImagePipeline] Error processing image:', image.url, error);
        processed.push(image); // Add original on error
      }
    }

    console.log(`[ImagePipeline] Batch processing complete: ${processed.length} images`);
    return processed;
  }

  /**
   * Generate image suggestions for a section
   */
  generateImageSuggestions(sectionTitle, sectionContent) {
    console.log('[ImagePipeline] Generating image suggestions...');

    const suggestions = [];

    // Analyze content type
    if (sectionContent.includes('architecture') || sectionContent.includes('시스템')) {
      suggestions.push({
        type: 'architecture',
        description: '시스템 아키텍처 다이어그램',
        priority: 'high'
      });
    }

    if (sectionContent.includes('workflow') || sectionContent.includes('프로세스')) {
      suggestions.push({
        type: 'workflow',
        description: '워크플로우 순서도',
        priority: 'high'
      });
    }

    if (sectionContent.includes('timeline') || sectionContent.includes('일정')) {
      suggestions.push({
        type: 'timeline',
        description: '프로젝트 타임라인',
        priority: 'medium'
      });
    }

    if (sectionContent.includes('데이터') || sectionContent.includes('database')) {
      suggestions.push({
        type: 'data',
        description: '데이터 모델 구조',
        priority: 'medium'
      });
    }

    // Always suggest illustrative images
    suggestions.push({
      type: 'illustration',
      description: '관련 일러스트레이션 (웹 검색)',
      priority: 'low'
    });

    return suggestions;
  }

  /**
   * Export image pipeline data
   */
  exportData() {
    return {
      total: this.images.length,
      images: this.images,
      cache: Array.from(this.imageCache.entries()),
      queue: this.getQueueStatus()
    };
  }

  /**
   * Clear all data
   */
  clear() {
    this.images = [];
    this.imageCache.clear();
    this.generationQueue = [];
  }
}

// Make globally available
window.ImagePipeline = ImagePipeline;

console.log('[ImagePipeline] Module loaded successfully');
