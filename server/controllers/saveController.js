const xController = require('./xController');
// Import other platform controllers here as they are created
const redditController = require('./redditController');

exports.saveContent = (req, res) => {
  const { platform } = req.body;

  if (!platform) {
    return res.status(400).send({ message: 'Platform is required' });
  }

  console.log(`Received save request for platform: ${platform}`);

  switch (platform.toLowerCase()) {
    case 'x':
    case 'twitter':
      xController.saveXContent(req, res);
      break;
    case 'reddit':
      redditController.saveRedditContent(req, res);
      break;
    // Add cases for other platforms
    // case 'reddit':
    //   redditController.saveRedditContent(req, res);
    //   break;
    default:
      console.log(`Unsupported platform: ${platform}`);
      res.status(400).send({ message: `Unsupported platform: ${platform}` });
  }
}; 