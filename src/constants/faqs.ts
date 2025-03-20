/**
 * Frequently Asked Questions for the Support page
 *
 * Each FAQ item contains:
 * - id: Unique identifier for the FAQ item
 * - question: The question text
 * - answer: The answer text (supports HTML)
 */
export type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

export const FAQS: FAQItem[] = [
  {
    id: 'what-is-emoji-map',
    question: '🧐 What is Emoji Map?',
    answer:
      '🗺️ Emoji Map is a simplified mapping tool that uses emojis to represent locations and points of interest. It&apos;s designed to be intuitive and easy to use, making map navigation more fun and accessible. Think of it as a way to see the world through emojis! 🌎✨',
  },
  {
    id: 'how-to-use',
    question: '📱 How do I use the Emoji Map app?',
    answer:
      '👆 Simply launch the app and navigate to the map view. You can tap on locations to see emoji representations or search for places using the search bar. Looking for restaurants? Find them marked with 🍔 or 🍕. Parks might show as 🌳 or 🏞️. The interface is designed to be intuitive - if you can use a regular map app, you can use Emoji Map! 🙌',
  },
  {
    id: 'android-availability',
    question: '🤖 Is Emoji Map available on Android?',
    answer:
      '🍎 Currently, Emoji Map is only available for iOS devices. We&apos;re exploring the possibility of an Android version in the future. Stay tuned for updates! 📢',
  },
  {
    id: 'suggest-emoji',
    question: '💡 How can I suggest a new emoji for a location type?',
    answer:
      '✉️ We welcome emoji suggestions! Please use the contact form below to send us your ideas. Include the location type and the emoji you think would represent it well. We love creative suggestions! 🎨',
  },
  {
    id: 'data-privacy',
    question: '🔒 Is my data private?',
    answer:
      "🛡️ Yes, we take privacy seriously. We only collect necessary data to provide the service and improve user experience. Your location data is processed securely and never shared with third parties without your consent. For more details, please refer to our <Link href='/privacy-policy' class='text-primary underline'>Privacy Policy</Link>. 📝",
  },
  {
    id: 'offline-use',
    question: '📵 Can I use Emoji Map offline?',
    answer:
      '✅ Yes, basic Emoji Map features work offline. The app caches data for areas you&apos;ve recently visited, allowing you to view the map and emojis without an internet connection. However, searching for new locations requires internet access. Perfect for travel! ✈️',
  },
  {
    id: 'custom-emojis',
    question: '🎨 Can I create custom emojis for my favorite places?',
    answer:
      '🔜 Not yet, but we&apos;re working on a feature that will allow users to create and save custom emoji markers for their favorite locations. Imagine marking your favorite coffee shop with your own personalized ☕ emoji! This will be available in a future update. 🚀',
  },
  {
    id: 'emoji-meaning',
    question: '❓ What do the different emojis mean?',
    answer:
      '📖 Each emoji represents a specific type of location or point of interest. For example:<br><br>🍽️ - Restaurants<br>🏨 - Hotels<br>🏛️ - Museums<br>⛪ - Places of worship<br>🏪 - Shops<br>🏥 - Hospitals<br>🏫 - Schools<br><br>You can tap on any emoji to see more details about that location! 🔍',
  },
  {
    id: 'share-locations',
    question: '📤 Can I share locations with friends?',
    answer:
      '👯 Absolutely! Just find the location you want to share, tap on its emoji, and use the share button. You can send locations via messages, email, or social media. It&apos;s a fun way to recommend places to friends and family! 🎉',
  },
];
