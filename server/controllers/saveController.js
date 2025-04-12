const xController = require('./xController');
// Import other platform controllers here as they are created
const redditController = require('./redditController');
const linkedinController = require('./linkedinController');

exports.saveContent = (req, res) => {
  console.log("[WTHAI:SaveController:saveContent] Function entry.");
  const { platform, userId, url } = req.body;

  console.log(`[WTHAI:SaveController:saveContent] Received request: Platform=${platform}, UserId=${userId ? 'Present' : 'Missing'}, Url=${url}`);

  // Basic validation
  if (!platform || !userId || !url) {
    console.error('[WTHAI:SaveController:saveContent] Validation failed: Missing platform, userId, or url.');
    return res.status(400).send({ message: 'Platform, userId, and url are required.' });
  }

  // Delegate based on platform
  if (platform === 'x') {
    console.log('[WTHAI:SaveController:saveContent] Delegating to xController...');
    xController.saveXContent(req, res);
  } else if (platform === 'reddit') {
    console.log('[WTHAI:SaveController:saveContent] Delegating to redditController...');
    redditController.saveRedditContent(req, res);
  } else if (platform === 'linkedin') {
    console.log('[WTHAI:SaveController:saveContent] Delegating to linkedinController...');
    linkedinController.saveLinkedInPost(req, res);
  } else {
    console.warn(`[WTHAI:SaveController:saveContent] Unsupported platform received: ${platform}`);
    res.status(400).send({ message: `Platform '${platform}' not supported.` });
  }
  console.log("[WTHAI:SaveController:saveContent] Delegating call finished (async operation might still be running).");
}; 