# Hello World Extension

## Local Development

1. Install the required dependencies:
   ```bash
   pnpm install
   ```
1. Copy the `.env.example` file to a new `.env` file and adjust the environment variables as needed:
   ```bash
   cp .env.example .env
   ```
1. Start the development server:
   ```bash
    pnpm run dev
    ```
   The Extension will now be available at your configured port, by default this is http://localhost:3000

### Creating a development Extension

The mStudio Marketplace does not explicitly offer a way to create different environments for your Extension.
However, you can create an Extension for development purposes. You don't have to publish this extension to the marketplace to use it for development purposes.
For further advice, how to create and configure an Extension, read the [How to manage Extensions Guide](https://developer.mittwald.de/docs/v2/contribution/how-to/manage-extensions/).

### Testing Webhooks

If you started your Extension in `dev` mode, webhooks cannot be called directly.
Webhooks are called from the backend of the mStudio Marketplace, so your localhost is not accessible.
To test webhooks locally, you need to expose your localhost to the internet using a tunneling service like [zrok](https://zrok.io/).

1. Register for a tier of zrok or host your own zrok relay server to expose your localhost to the internet.
   We recommend using zrok for ease of use. It provides a possibility to create secure and **stable** URLs to your localhost.
   To get started with zrok, we recommend following their [Getting Started Guide](https://docs.zrok.io/docs/getting-started/).
1. Once you have signed up for or hosted yourself a zrok relay server and [enabled your device for the environment](https://docs.zrok.io/docs/getting-started/#enabling-your-zrok-environment), you can create a reserved zrok tunnel to your localhost by running the following command:
   ```bash
   sudo zrok reserve public 3000
   ```
   This will create a token-based URL that stably points to your localhost on port `3000` if you start the share.
   If you changed the default port of your development server, replace `3000` with your configured port.
   You can try to execute the command without `sudo` first. We just added it here to avoid permission issues on some systems as MacOS.
1. Set the environment variable `ZROK_RESERVED_TOKEN` in your .env file according to the .env.example file.
   This will enable you to use our prepared package script to expose your localhost to the internet.
1. Start the zrok share by running the following command:
   ```bash
    pnpm run dev:expose
    ```
   Your locally running extension is now exposed to the internet via the stable zrok URL and can be configured in the mStudio Marketplace to receive webhooks.
1. Open up your registered extension in the mStudio and configure the webhook URL to point to your zrok URL, e.g. `https://<your-zrok-reserved-token>.share.zrok.io/api/webhooks/mittwald`.
1. To test, if your webhooks are working as expected, you can create Extension Instances, change the Extension's required scopes or remove them.
   This will trigger webhooks from the mStudio Marketplace to your locally running Extension.
   To read more about how to create Extension Instances of not published Extensions, read the [How to Create an Extension Instance Guide](https://developer.mittwald.de/docs/v2/contribution/how-to/local-development/#creating-an-extension-instance)
1. To stop exposing your localhost, simply stop the running process by pressing `CTRL + C` in the terminal where you started the zrok share.

