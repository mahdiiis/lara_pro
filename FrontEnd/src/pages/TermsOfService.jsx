import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function TermsOfService() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-8 w-full max-w-4xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold gradient-text">Terms of Service</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Last updated: March 20, 2025
          </p>
        </div>

        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          <section>
            <h3 className="text-xl font-semibold mb-3 text-purple-main">1. Introduction</h3>
            <p>
              Welcome to our platform. These Terms of Service govern your use of our website and services. 
              By accessing or using our services, you agree to be bound by these Terms.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-purple-main">2. Account Registration</h3>
            <p>
              When you create an account with us, you must provide accurate and complete information. 
              You are responsible for maintaining the security of your account and password.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-purple-main">3. User Conduct</h3>
            <p>
              You agree not to use our service for any illegal purposes or to conduct any illegal activity. 
              You are solely responsible for your conduct and any content that you create, post, or display on or through the service.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-purple-main">4. Content</h3>
            <p>
              Our service allows you to post, store, share, and otherwise make available certain information, text, graphics, or other material. 
              You retain any and all of your rights to any content you submit, post or display and you are responsible for protecting those rights.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-purple-main">5. Termination</h3>
            <p>
              We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, 
              under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-purple-main">6. Changes to Terms</h3>
            <p>
              We reserve the right to modify or replace these Terms at any time. It is your responsibility to check our Terms periodically for changes.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-purple-main">7. Contact Us</h3>
            <p>
              If you have any questions about these Terms, please contact us.
            </p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/signup"
            className="font-medium text-purple-main hover:text-purple-light dark:text-purple-light dark:hover:text-purple-main"
          >
            Back to Sign Up
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default TermsOfService;
