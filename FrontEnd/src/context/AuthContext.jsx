import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const handlePageRefresh = () => {
      sessionStorage.setItem("pageRefreshed", "true");
    };

    // Set page refresh listener
    window.addEventListener("beforeunload", handlePageRefresh);

    // Check for stored credentials
    const checkAuth = async () => {
      // First check localStorage (for remembered logins)
      const storedRememberMe = localStorage.getItem("rememberMe");
      const localStoredUser = localStorage.getItem("user");
      const localStoredToken = localStorage.getItem("token");
      
      // Then check sessionStorage (for non-remembered logins)
      const sessionUser = sessionStorage.getItem("user");
      const sessionToken = sessionStorage.getItem("token");
      
      // Prioritize using the authentication data based on "Remember me" setting
      const storedUser = storedRememberMe ? localStoredUser : (sessionUser || localStoredUser);
      const storedToken = storedRememberMe ? localStoredToken : (sessionToken || localStoredToken);

      if (storedUser && storedToken) {
        try {
          // Parse user from storage
          const userData = JSON.parse(storedUser);
          setUser(userData);

          // Set profile image from stored user data
          if (userData.profile_image) {
            const imageUrl = userData.profile_image.startsWith("/")
              ? `${import.meta.env.VITE_API_URL.replace("/api/", "")}${
                  userData.profile_image
                }`
              : userData.profile_image;
            setProfileImage(imageUrl);
          }

          // Verify token is valid with API
          const response = await axios.get(`${apiUrl}user`, {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });

          // Update with fresh data from API
          const freshUserData = response.data;
          setUser(freshUserData);
          
          // Save user data to appropriate storage based on "Remember me" setting
          if (storedRememberMe) {
            localStorage.setItem("user", JSON.stringify(freshUserData));
          } else {
            sessionStorage.setItem("user", JSON.stringify(freshUserData));
          }

          // Update profile image with fresh data
          if (freshUserData.profile_image) {
            const imageUrl = freshUserData.profile_image.startsWith("/")
              ? `${import.meta.env.VITE_API_URL.replace("/api/", "")}${
                  freshUserData.profile_image
                }`
              : freshUserData.profile_image;
            setProfileImage(imageUrl);
          }
        } catch (error) {
          console.error("Session validation error:", error);
          // Clear invalid session
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          localStorage.removeItem("rememberMe");
          sessionStorage.removeItem("user");
          sessionStorage.removeItem("token");
          setUser(null);
          setProfileImage(null);
        } finally {
          setUserLoading(false);
        }
      } else {
        setUserLoading(false);
      }
    };

    checkAuth();

    const storedQuizzes = localStorage.getItem("quizzes");
    if (storedQuizzes) {
      setQuizzes(JSON.parse(storedQuizzes));
    }

    setLoading(false);

    return () => {
      window.removeEventListener("beforeunload", handlePageRefresh);
    };
  }, [apiUrl]);

  useEffect(() => {
    // Ensure any existing profile image from a logged-in user is immediately displayed
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // Immediately update profile image if available
        if (userData.profile_image) {
          const imageUrl = userData.profile_image.startsWith("/")
            ? `${import.meta.env.VITE_API_URL.replace("/api/", "")}${
                userData.profile_image
              }?t=${Date.now()}`
            : userData.profile_image;
          setProfileImage(imageUrl);
        }
      } catch (e) {
        console.error("Error parsing stored user data:", e);
      }
    }
  }, []); // Empty dependency array ensures this runs only once

  const login = async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${apiUrl}login`, credentials);
      const { user, token } = response.data;

      // Set the token in local storage
      localStorage.setItem("token", token);

      // Save user data to local storage
      localStorage.setItem("user", JSON.stringify(user));

      // Set the user state
      setUser(user);

      // Set profile image if available
      if (user.profile_image) {
        setProfileImage(user.profile_image);
      }

      setIsAuthenticated(true);
      setLoading(false);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);

      // Handle specific error cases
      if (error.response) {
        if (error.response.status === 429) {
          setError("Too many login attempts. Please try again later.");
        } else if (error.response.status === 401) {
          setError("Invalid email or password.");
        } else {
          setError(
            error.response.data.message || "An error occurred during login."
          );
        }
      } else {
        setError("Network error. Please check your connection.");
      }

      setLoading(false);
      throw error;
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${apiUrl}register`, userData);

      // After successful registration, log in automatically
      const loginResponse = await axios.post(`${apiUrl}login`, {
        email: userData.email,
        password: userData.password,
      });

      const { user, token } = loginResponse.data;

      // Set the token in local storage
      localStorage.setItem("token", token);

      // Save user data to local storage
      localStorage.setItem("user", JSON.stringify(user));

      // Set the user state
      setUser(user);

      // Set profile image if available
      if (user.profile_image) {
        setProfileImage(user.profile_image);
      }

      setIsAuthenticated(true);
      setLoading(false);

      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);

      // Handle specific error cases
      if (error.response) {
        // Validation errors
        if (error.response.status === 422) {
          const errors = error.response.data.errors;
          let errorMessage = "Validation error: ";

          // Extract all validation errors
          for (const field in errors) {
            errorMessage += errors[field].join(", ");
          }

          setError(errorMessage);
        } else {
          setError(
            error.response.data.message ||
              "An error occurred during registration."
          );
        }
      } else {
        setError("Network error. Please check your connection.");
      }

      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    // Try to call the server logout endpoint if token exists
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      try {
        await axios.post(
          `${apiUrl}logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        // Continue with local logout even if server logout fails
      }
    }

    // Clear all storage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("rememberMe");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    
    // Reset state
    setUser(null);
    setProfileImage(null);
    setIsAuthenticated(false);

    return { success: true };
  };

  const updateUserProfile = async (profileData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(`${apiUrl}profile`, profileData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // Check if the response has user data
      if (response.data && response.data.user) {
        const updatedUserData = response.data.user;
        localStorage.setItem("user", JSON.stringify(updatedUserData));
        setUser(updatedUserData);

        // If the server returned a new token, update it
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }

        return { success: true };
      } else {
        console.error(
          "Profile update error: Invalid response format",
          response.data
        );
        throw new Error("Invalid server response");
      }
    } catch (error) {
      console.error("Profile update error:", error);

      // Handle specific error cases
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error(
            "You can't do modifications more than one time! Try again after 2 minutes."
          );
        } else if (error.response.status === 422) {
          const errors = error.response.data.errors;
          if (errors) {
            const errorMessages = Object.values(errors).flat().join(", ");
            throw new Error(`Validation error: ${errorMessages}`);
          } else {
            throw new Error("Validation error: Please check your input.");
          }
        }
      }

      throw error;
    }
  };

  const updateUserPassword = async ({ currentPassword, newPassword }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${apiUrl}profile`,
        {
          password: newPassword,
          password_confirmation: newPassword, // Assuming password confirmation is handled on the frontend
          current_password: currentPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // If the server returned a new token, update it
      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      return { success: true };
    } catch (error) {
      console.error("Password update error:", error);

      // Handle specific error cases
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error(
            "You can't do modifications more than one time! Try again after 2 minutes."
          );
        } else if (error.response.status === 422) {
          const errors = error.response.data.errors;
          if (errors) {
            const errorMessages = Object.values(errors).flat().join(", ");
            throw new Error(`Validation error: ${errorMessages}`);
          } else {
            throw new Error("Validation error: Please check your input.");
          }
        }
      }

      throw error;
    }
  };

  // Add this function to refresh user data
  const refreshUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(`${apiUrl}user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userData = response.data;
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      // Update profile image if available
      if (userData.profile_image) {
        const imageUrl = userData.profile_image.startsWith("/")
          ? `${import.meta.env.VITE_API_URL.replace("/api/", "")}${
              userData.profile_image
            }`
          : userData.profile_image;
        setProfileImage(imageUrl);
      }

      return userData;
    } catch (error) {
      console.error("Error refreshing user data:", error);
      return null;
    }
  };

  const updateProfileImage = async (imageFile) => {
    try {
      // Check file size before processing
      if (imageFile.size > 2 * 1024 * 1024) {
        // Lower limit to 2MB
        throw new Error(
          "Image size exceeds 2MB. Please select a smaller image."
        );
      }

      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        // Set a timeout for the entire operation
        const timeoutId = setTimeout(() => {
          reject(
            new Error(
              "Image upload timed out. Please try again with a smaller image."
            )
          );
        }, 20000); // 20 seconds timeout

        reader.onload = async () => {
          try {
            const imageUrl = reader.result;
            const token = localStorage.getItem("token");

            console.log(
              "Uploading profile image, size:",
              Math.round(imageUrl.length / 1024),
              "KB"
            );

            // If the image is too large, reject immediately
            if (imageUrl.length > 1500000) {
              // ~1.5MB in base64
              clearTimeout(timeoutId);
              reject(
                new Error(
                  "Image is too large after processing. Please use a smaller image."
                )
              );
              return;
            }

            // Validate that the imageUrl is properly formatted
            if (!imageUrl || !imageUrl.startsWith("data:image/")) {
              clearTimeout(timeoutId);
              reject(
                new Error("Invalid image format. Please try a different image.")
              );
              return;
            }

            // Immediately update UI with the new image (optimistic update)
            setProfileImage(imageUrl);

            try {
              // Update profile image on the backend
              const response = await axios.put(
                `${apiUrl}profile`,
                { profile_image: imageUrl },
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  timeout: 10000, // 10 seconds timeout for the API call
                }
              );

              const updatedUser = response.data.user;

              // If we got a new token due to sensitive data change, update it
              if (response.data.token) {
                localStorage.setItem("token", response.data.token);
              }

              // Update local storage and state
              localStorage.setItem("user", JSON.stringify(updatedUser));
              setUser(updatedUser);

              // Handle the profile image URL for display
              if (updatedUser.profile_image) {
                let profileImageUrl;

                // Handle case where image is base64 data URI
                if (updatedUser.profile_image.startsWith("data:image/")) {
                  profileImageUrl = updatedUser.profile_image;
                }
                // Handle case where image is a relative path
                else if (updatedUser.profile_image.startsWith("/")) {
                  const baseUrl = import.meta.env.VITE_API_URL.replace(
                    "/api/",
                    ""
                  );
                  profileImageUrl = `${baseUrl}${
                    updatedUser.profile_image
                  }?t=${Date.now()}`;
                }
                // Handle case where image is a full URL
                else {
                  profileImageUrl = `${
                    updatedUser.profile_image
                  }?t=${Date.now()}`;
                }

                setProfileImage(profileImageUrl);

                // Force a refresh of user data to ensure UI updates
                setTimeout(() => refreshUserData(), 1000);
              }

              // Clear the timeout since operation succeeded
              clearTimeout(timeoutId);
              resolve({ success: true });
            } catch (error) {
              // Handle specific error cases
              if (error.response) {
                if (error.response.status === 401) {
                  clearTimeout(timeoutId);
                  reject(
                    new Error(
                      "You can't do modifications more than one time! Try again after 2 minutes."
                    )
                  );
                  return;
                } else if (error.response.status === 422) {
                  clearTimeout(timeoutId);
                  const errors = error.response.data.errors;
                  if (errors) {
                    const errorMessages = Object.values(errors)
                      .flat()
                      .join(", ");
                    reject(new Error(`Validation error: ${errorMessages}`));
                  } else {
                    reject(
                      new Error("Validation error: Please check your input.")
                    );
                  }
                  return;
                }
              }
              throw error;
            }
          } catch (error) {
            clearTimeout(timeoutId);
            console.error("Error updating profile image on server:", error);

            // More detailed error logging
            if (error.response) {
              console.error("Server response error:", error.response.data);
            }

            reject(error);
          }
        };

        reader.onerror = (event) => {
          clearTimeout(timeoutId);
          console.error("File reading error:", event);
          reject(new Error("Failed to read the image file."));
        };

        reader.readAsDataURL(imageFile);
      });
    } catch (error) {
      console.error("Profile image update error:", error);
      throw error;
    }
  };

  const addQuiz = (quiz) => {
    const newQuizzes = [...quizzes, quiz];
    setQuizzes(newQuizzes);
    localStorage.setItem("quizzes", JSON.stringify(newQuizzes));
  };

  const setAllQuizzes = (allQuizzes) => {
    setQuizzes(allQuizzes);
    localStorage.setItem("quizzes", JSON.stringify(allQuizzes));
  };

  const getQuizCount = () => quizzes.length;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateUserProfile,
        updateUserPassword,
        updateProfileImage,
        loading,
        quizzes,
        addQuiz,
        getQuizCount,
        profileImage,
        setAllQuizzes,
        userLoading,
        error,
        isAuthenticated,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
