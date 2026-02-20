import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function PrivacyPolicy() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-8 w-full max-w-4xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold gradient-text">Privacy Policy</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Last updated: March 20, 2025
          </p>
        </div>

        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          <section>
            <h3 className="text-xl font-semibold mb-3 text-purple-main">1. Information We Collect</h3>
            <p>
              We collect information you provide directly to us when you create an account, use our services, 
              or communicate with us. This may include your name, email address, password, and any other information you choose to provide.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-purple-main">2. How We Use Information</h3>
            <p>
              We use the information we collect to provide, maintain, and improve our services, 
              to process and complete transactions, and to communicate with you about our services, 
              updates, security alerts, and support and administrative messages.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-purple-main">3. Information Sharing</h3>
            <p>
              We do not share your personal information with third parties without your consent except in the following circumstances:
              with vendors and service providers who need access to such information to carry out work on our behalf;
              in response to a request for information if we believe disclosure is in accordance with any applicable law, 
              regulation or legal process; and if we believe your actions are inconsistent with our user agreements or policies.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-purple-main">4. Data Security</h3>
            <p>
              We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, 
              disclosure, alteration and destruction. However, no security system is impenetrable and we cannot guarantee the 
              security of our systems 100%.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-purple-main">5. Data Retention</h3>
            <p>
              We store the information we collect about you for as long as is necessary for the purpose(s) for which we 
              originally collected it. We may retain certain information for legitimate business purposes or as required by law.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-purple-main">6. Your Rights</h3>
            <p>
              You may access, correct, or delete your account information at any time by logging into your account. 
              If you wish to delete your account, please contact us.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-purple-main">7. Changes to Privacy Policy</h3>
            <p>
              We may modify this Privacy Policy from time to time. If we make material changes to this policy, 
              we will notify you by email or through our services.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-purple-main">8. Contact Us</h3>
            <p>
              If you have any questions about this Privacy Policy, please contact us.
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

export default PrivacyPolicy;
