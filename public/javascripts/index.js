/* eslint-env browser */
document.addEventListener("DOMContentLoaded", () => {
  // eslint-disable-next-line max-len
  // ---------------------------------------------------------------------------------------------------
  const formInputs = [
    document.getElementById("fname"),
    document.getElementById("username"),
    document.getElementById("email"),
    document.getElementById("mobile"),
    document.getElementById("password"),
  ];

  // input field error displaying div
  const inpError = document.querySelectorAll(".invalid-feedback");

  // display required message when input field loose focus
  formInputs.forEach((input, index) => {
    if (input) {
      input.addEventListener("blur", (event) => {
        try {
          if (!input.value.trim()) {
            event.preventDefault();
            input.classList.add("is-invalid");
            inpError[index].textContent = "*This field is required";
          } else {
            input.classList.remove("is-invalid");
          }
        } catch (err) {
          console.log(`user regInput field blur eventListener Error: ${err}`);
        }
      });
    }
  });

  // user registration form submission
  const userRegistrationForm = document.getElementById("user-register-form");

  if (userRegistrationForm) {
    userRegistrationForm.addEventListener("submit", (event) => {
      try {
        console.log("form submitted");
        // remove past OTP timer that stored in local storage
        localStorage.removeItem("otpTimer");

        resetErrors();

        let isEmpty = false;
        let isValid = true;
        let allErrors = [];
        // check empty field
        document.querySelectorAll(".signup-input").forEach((input, index) => {
          if (!input.value.trim()) {
            isEmpty = true;
            event.preventDefault();
            input.classList.add("is-invalid");
            inpError[index].textContent = "*This field is required";
          } else {
            input.classList.remove("is-invalid");
          }

          if (!isEmpty) {
            // Validate first name
            if (input.id === "fname") {
              const lengthVal = RegexValidation(
                "fname",
                /^.{3,20}$/,
                "*Full name should be between 3 and 20 characters"
              );
              const letterVal = RegexValidation(
                "fname",
                /^[a-zA-Z\s]+$/,
                "*Name can't contain numbers or symbols"
              );

              if (!lengthVal.isValid) {
                console.log(`${input.id}length is false`);
                allErrors.push(lengthVal.errorMessage);
                isValid = false;
              }

              if (!letterVal.isValid) {
                console.log(`${input.id}letter is false`);
                allErrors.push(letterVal.errorMessage);
                isValid = false;
              }
              if (!isValid) {
                event.preventDefault();
                input.classList.add("is-invalid");
                allErrors.forEach((error) =>
                  displayError(`${input.id}Error`, error)
                );
              } else {
                allErrors = [];
                // isValid = true;
                input.classList.remove("is-invalid");
              }
            }
            console.log("after fname validate isvalid", isValid);
            // username validation
            if (input.id === "username") {
              // isValid = true;
              allErrors = [];
              const lengthVal = RegexValidation(
                "username",
                /^.{3,20}$/,
                "*Username should be between 3 and 20 characters"
              );
              const letterVal = RegexValidation(
                "username",
                /^[a-zA-Z0-9_]+$/,
                "*Username should only contain A-z, 0-9, and _"
              );

              if (!lengthVal.isValid) {
                console.log(`${input.id}length is false`);
                allErrors.push(lengthVal.errorMessage);
                isValid = false;
              }

              if (!letterVal.isValid) {
                allErrors.push(letterVal.errorMessage);
                isValid = false;
              }
              if (!isValid) {
                event.preventDefault();
                input.classList.add("is-invalid");
                return allErrors.forEach((error) =>
                  displayError(`${input.id}Error`, error)
                );
              }
              // isValid = true;
              allErrors = [];
              input.classList.remove("is-invalid");
            }
            console.log("after userName validate isvalid", isValid);
            // email validation
            if (input.id === "email") {
              // isValid = true;
              allErrors = [];
              const letterVal = RegexValidation(
                "email",
                /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/,
                "*Invalid email address"
              );
              if (!letterVal.isValid) {
                console.log(`${input.id}letter is false`);
                allErrors.push(letterVal.errorMessage);
                isValid = false;
              }
              if (!isValid) {
                event.preventDefault();
                input.classList.add("is-invalid");
                allErrors.forEach((error) =>
                  displayError(`${input.id}Error`, error)
                );
              } else {
                allErrors = "";
                input.classList.remove("is-invalid");
              }
            }
            console.log("after email validate isvalid", isValid);
            // mobile number validation
            if (input.id === "mobile") {
              // isValid = true;
              allErrors = [];
              const lengthVal = RegexValidation(
                "mobile",
                /^\d{10}$/,
                "*Please enter a valid 10-digit phone number"
              );
              if (!lengthVal.isValid) {
                console.log(`${input.id}length is false`);
                allErrors.push(lengthVal.errorMessage);
                isValid = false;
              }
              if (!isValid) {
                event.preventDefault();
                input.classList.add("is-invalid");
                allErrors.forEach((error) =>
                  displayError(`${input.id}Error`, error)
                );
              } else {
                // isValid = true;
                allErrors = [];
                input.classList.remove("is-invalid");
              }
            }
            console.log("after mobile validate isvalid", isValid);
            // password validation
            if (input.id === "password") {
              console.log(input);
              console.log("inside password validtion");
              // isValid = true;
              allErrors = [];
              const spaceVal = RegexValidation(
                "password",
                /^\S*$/,
                "*Password should not contain spaces"
              );
              const lengthVal = RegexValidation(
                "password",
                /^.{8,}$/,
                "*Password must be at least 8 characters"
              );
              const letterVal = RegexValidation(
                "password",
                /^(?=.*[A-Z])(?=.*[0-9]).*$/,
                "*Password should contain at least one uppercase letter and one number"
              );
              if (!spaceVal.isValid) {
                console.log(`${input.id}space check return false`);
                allErrors.push(spaceVal.errorMessage);
                isValid = false;
              }
              if (!lengthVal.isValid) {
                console.log(`${input.id}length is false`);
                allErrors.push(lengthVal.errorMessage);
                isValid = false;
              }

              if (!letterVal.isValid) {
                console.log("inside letter not valid");
                allErrors.push(letterVal.errorMessage);
                isValid = false;
              }
              if (!isValid) {
                console.log("inside final invalid");
                event.preventDefault();
                input.classList.add("is-invalid");
                allErrors.forEach((error) =>
                  displayError(`${input.id}Error`, error)
                );
              } else {
                console.log("inside else case");
                isValid = true;
                allErrors = [];
                input.classList.remove("is-invalid");
              }
            }
            console.log("after password validate isvalid", isValid);
          } else {
            console.log("Please check any field is empty");
          }
        });

        // check the input for updating or new userData
        const formPurpose = document.getElementById("form-purpose").value;
        const userId = document.getElementById("user-id").value;
        const userData = {
          fname: document.getElementById("fname").value,
          userName: document.getElementById("username").value,
          email: document.getElementById("email").value,
          mobileNumber: document.getElementById("mobile").value,
        };
        console.log(isValid);
        if (isValid && formPurpose === "update") {
          event.preventDefault();
          console.log("form purpose is:", formPurpose);

          fetch(`/account/update_user_data/${userId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
          })
            .then((response) => response.json())
            .then((data) => {
              console.log(data);
              if (data.error || data.otpRequired) {
                if (data.error) {
                  document.getElementById("email").classList.add("is-invalid");
                  document.getElementById("emailError").textContent =
                    data.error;
                }

                if (data.otpRequired) {
                  // show OTP section
                  document
                    .getElementById("otp-section")
                    .classList.remove("d-none");
                  document.getElementById("overlay").classList.remove("d-none");
                  startTimer();
                }
              } else {
                document.getElementById("email").classList.remove("is-invalid");
                document.getElementById("emailError").textContent = "";
                window.location.href = "/account";
              }
            })
            .catch((err) => {
              console.error("Error updating user data:", err);
            });
        }
      } catch (err) {
        console.log(`userReg Form submission Error: ${err}`);
      }
    });
  }

  // -----------------------------------------------------------------------------------------------

  // iterate otp fields
  const codes = document.querySelectorAll(".code");
  if (codes.length > 0) {
    codes[0].focus();
    codes.forEach((code, indx) => {
      try {
        code.addEventListener("keydown", (e) => {
          if (e.key >= 0 && e.key <= 9) {
            if (codes[indx].value.length === 0) {
              codes[indx].value = e.key;
              setTimeout(() => codes[indx + 1].focus(), 10);
            }
          } else if (e.key === "Backspace") {
            setTimeout(() => codes[indx - 1].focus(), 10);
            codes[indx].value = "";
          }
          e.preventDefault();
        });
      } catch (err) {
        console.log(`iterate otp field function Error: ${err}`);
      }
    });
  }

  // OTP submission validation
  const otpForm = document.getElementById("otp-form");
  if (otpForm) {
    otpForm.addEventListener("submit", async (event) => {
      try {
        console.log("otp form submitted");
        const inputOTP = [];
        // check empty field
        document.querySelectorAll(".otp-input").forEach((input) => {
          const otpError = document.getElementById("otp-error");
          if (!input.value.trim()) {
            event.preventDefault();
            otpError.textContent = "Please enter the OTP code";
          } else {
            inputOTP.push(input.value.trim());
            otpError.classList.add("d-none");
          }
        });
        console.log("after collecting otp:", inputOTP);
        let otpData = {};
        console.log("before converting to object:", otpData);
        // check collected otp and convert to object
        if (inputOTP.length > 0) {
          otpData = {
            otpCode: inputOTP.join(""),
          };
        } else {
          event.preventDefault();
          throw new Error("collected OTP length is false");
        }
        console.log("after converting to object:", otpData);
        // check the otp for updating existing email or new register
        const otpFormPurpose =
          document.getElementById("otp-form-purpose").value;
        console.log(
          "otp form purpose:",
          document.getElementById("otp-form-purpose").value
        );
        const userId = document.getElementById("user-id").value;
        console.log("user id", userId);
        if (otpFormPurpose === "update") {
          console.log("inside the if condition");
          event.preventDefault();
          console.log("after preventing event");
          console.log("before patch req");
          const response = await fetch(`/validate_otp/${userId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(otpData),
          });
          if (response.ok) {
            const data = await response.json();
            console.log(data.message);
            window.location.href = "/account";
          }
          if (!response.ok) {
            const data = await response.json();
            console.log(data.error);
            console.log(document.getElementById("otp-error"));
            document.getElementById("otp-error").textContent = data.error;
            document.getElementById("otp-error").classList.remove("d-none");
          } else {
            document.getElementById("otp-error").textContent = "";
            document.getElementById("otp-error").classList.remove("d-none");
          }
        }
      } catch (err) {
        console.log(`OTP validation error:${err}`);
      }
    });
  }

  // user sign in validation
  const userSignin = document.getElementById("user-signin");
  const adminSigin = document.getElementById("admin-signin-form");
  const form = userSignin || adminSigin;
  if (form) {
    form.addEventListener("submit", (event) => {
      try {
        console.log("log in button clicked");
        // check empty field
        document.querySelectorAll(".signin-input").forEach((input) => {
          if (!input.value.trim()) {
            event.preventDefault();
            input.classList.add("is-invalid");
          } else {
            input.classList.remove("is-invalid");
          }
        });
      } catch (err) {
        console.log(`signin Error: ${err}`);
      }
    });
  }

  // Show signup reminder box in home page
  const signBox = document.getElementById("arrow-box");
  if (signBox) {
    setTimeout(() => {
      signBox.style.opacity = 0;
      setTimeout(() => {
        signBox.style.display = "none";
      }, 300);
    }, 3000);
  }

  // replace the main image with sub image when click on it
  const subImgSet = document.getElementById("sub-img-set");
  const maiImg = document.getElementById("main-img");
  if (subImgSet && maiImg) {
    subImgSet.addEventListener("click", (event) => {
      if (event.target.tagName === "IMG") {
        const imageUrl = event.target.src;
        maiImg.src = imageUrl;
      }
    });
  }

  // Add to cart functionality
  const addToCartBtn = document.getElementById("add-to-cart-btn");
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      const proId = addToCartBtn.getAttribute("data-product-id");
      console.log("proId", proId);
      try {
        await fetch("/add_to_cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ proId }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("response:", data);
            if (data.redirect) {
              window.location.href = data.redirect; // redirecting to shopping cart page
            } else if (data.message) {
              showSuccessMsg(data.message);
              const cartQty = document.getElementById("cart-qty");
              if (data.cartItemQty) {
                cartQty.innerHTML = data?.cartItemQty;
              }
            }
          })
          .catch((err) => {
            throw new Error(err.message);
          });
      } catch (err) {
        console.error("product adding to shopping cart error: ", err);
      }
    });
  }

  // remove item from shopping cart;
  const removeCartItems = document.querySelectorAll(".remove-cart-item");
  if (removeCartItems) {
    removeCartItems.forEach((item) => {
      item.addEventListener("click", async (e) => {
        try {
          const { productId } = e.target.closest(".cart-item").dataset;
          const response = await fetch(`/remove_from_cart/${productId}`, {
            method: "DELETE",
          });
          if (response.ok) {
            const data = await response.json();
            console.log(data.message);
            showSuccessMsg(data.message);
            e.target.closest(".cart-item").remove();
            updateSubtotal();
            const cartQty = document.getElementById("cart-qty");
            cartQty.innerHTML = parseInt(cartQty.innerHTML, 10) - 1;
          } else {
            throw new Error("Failed to remove item from cart");
          }
        } catch (err) {
          console.error("remove cart item error: ", err.message);
        }
      });
    });
  }

  // update cart item quantity
  const cartItems = document.querySelectorAll(".cart-item");
  const page = document.getElementById("page")?.value;
  if (cartItems && page === "cart") {
    cartItems.forEach((item) => {
      const minusBtn = item.querySelector(".minus-btn");
      const plusBtn = item.querySelector(".plus-btn");
      const qty = item.querySelector(".qty");
      const cartItemId = item.dataset.productId;

      // plus button function
      plusBtn.addEventListener("click", async () => {
        try {
          let quantity = parseInt(qty.textContent, 10);
          // eslint-disable-next-line no-plusplus
          quantity++;
          const response = await updateCartItemQty(cartItemId, quantity);
          if (response) {
            qty.textContent = quantity;
          }
        } catch (err) {
          console.error("cart item quantity incrementing error: ", err.message);
        }
      });

      // minus button function
      minusBtn.addEventListener("click", async () => {
        try {
          let quantity = parseInt(qty.textContent, 10);
          if (quantity > 1) {
            // eslint-disable-next-line no-plusplus
            quantity--;
            qty.textContent = quantity;
            updateCartItemQty(cartItemId, quantity);
          }
        } catch (err) {
          console.error(err.message);
        }
      });
    });
  }
  // -----------------------------------------------------------------------------------------------
  // Add new address form validation

  const addressForm = document.getElementById("addressForm");
  if (addressForm && inpError.length !== 0) {
    let isEmpty = false;
    addressForm.addEventListener("submit", async (event) => {
      try {
        console.log("address form submitted");
        // check empty field
        document.querySelectorAll(".address-input").forEach((input) => {
          let isValid = true;
          let errMsgs = [];
          console.log("inside the forEach");
          if (!input.value.trim()) {
            isEmpty = true;
            event.preventDefault();
            input.classList.add("is-invalid");
            const errorElement = input.nextElementSibling;
            errorElement.textContent = "*This field is required";
          } else {
            input.classList.remove("is-invalid");
            isEmpty = false;
          }
          if (!isEmpty) {
            // fname validation
            if (input.id === "fname") {
              console.log("validating fname");
              console.log(errMsgs);
              const lengthVal = RegexValidation(
                "fname",
                /^.{3,50}$/,
                "*Full name should be between 3 and 50 characters"
              );
              const letterVal = RegexValidation(
                "fname",
                /^[a-zA-Z\s]+$/,
                "*Name can't contain numbers or symbols"
              );

              if (!lengthVal.isValid) {
                console.log(`${input.id}length is false`);
                errMsgs.push(lengthVal.errorMessage);
                isValid = false;
              }
              console.log(errMsgs);
              if (!letterVal.isValid) {
                console.log(`${input.id}letter is false`);
                errMsgs.push(letterVal.errorMessage);
                isValid = false;
              }
              console.log(errMsgs);
              if (!isValid) {
                event.preventDefault();
                input.classList.add("is-invalid");
                console.log(errMsgs);
                errMsgs.forEach((error) => displayError("fnameError", error));
              } else {
                errMsgs = [];
                isValid = true;
                input.classList.remove("is-invalid");
              }
              console.log(errMsgs);
            }

            // PIN code validation
            if (input.id === "PINCode") {
              console.log("validating PIN code");
              const { value } = input;
              if (!/^[0-9]+$/.test(value)) {
                event.preventDefault();
                displayError(
                  `${input.id}Error`,
                  "*PIN code should contain only numbers (0-9)"
                );
                input.classList.add("is-invalid");
              } else if (value.length !== 6) {
                event.preventDefault();
                displayError(
                  `${input.id}Error`,
                  "*PIN code should be exactly 6 digits"
                );
                input.classList.add("is-invalid");
              } else {
                input.classList.remove("is-invalid");
              }
            }
            // mobile number validation
            if (input.id === "mobile") {
              const lengthVal = RegexValidation(
                "mobile",
                /^\d{10}$/,
                "*Please enter a valid 10-digit phone number"
              );
              const letterVal = RegexValidation(
                "mobile",
                /^[0-9]+$/,
                "*Mobile number should contain only numbers (0-9)"
              );
              if (!lengthVal.isValid) {
                console.log(`${input.id}length is false`);
                errMsgs.push(lengthVal.errorMessage);
                isValid = false;
              }
              if (!letterVal.isValid) {
                console.log(`${input.id}length is false`);
                errMsgs.push(letterVal.errorMessage);
                isValid = false;
              }
              if (!isValid) {
                event.preventDefault();
                input.classList.add("is-invalid");
                errMsgs.forEach((error) => displayError("mobileError", error));
              } else {
                input.classList.remove("is-invalid");
              }
            }
          }
        });

        const formPurpose = document.getElementById("form-purpose").value;
        const { addressId } = document.getElementById("form-purpose").dataset;
        if (formPurpose && formPurpose === "edit") {
          event.preventDefault();
          if (!addressId) {
            throw new Error("couldn't find the address id");
          }
          const formData = {
            name: document.getElementById("fname").value,
            country: document.getElementById("country").value,
            state: document.getElementById("state").value,
            district: document.getElementById("district").value,
            PINCode: document.getElementById("PINCode").value,
            mobile: document.getElementById("mobile").value,
            city: document.getElementById("city").value,
            landmark: document.getElementById("landmark").value,
            address: document.getElementById("address").value,
          };

          const response = await fetch(
            `/account/manage_address/edit_address/${addressId}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(formData),
            }
          );

          if (response.ok) {
            const data = await response.json();
            console.log(data.message);
            window.location.href = "/account/manage_address";
          } else {
            const data = await response.json();
            throw new Error(data.error);
          }
        }
      } catch (err) {
        console.error("add new address error: ", err);
      }
    });
  }
  // remove success message after 3sec
  const successMsg = document.getElementById("successMsg");
  if (successMsg) {
    setTimeout(() => {
      successMsg.remove();
    }, 3000);
  }

  // Place order form submission
  const placeOrderBtn = document.getElementById("place-order-btn");
  if (placeOrderBtn) {
    const form = document.getElementById("billing-info-form");
    const subtotal = parseFloat(
      document
        .getElementById("cart-subtotal")
        .textContent.trim()
        .replace("₹", "")
    );
    let isValid = true;

    // add click event listener
    placeOrderBtn.addEventListener("click", async () => {
      try {
        console.log("place order button clicked");
        // check for existing order ID for retry order
        const existingOrderId = placeOrderBtn.dataset.orderId;

        const discountText = document
          .getElementById("cart-discount")
          .textContent.trim()
          .match(/\d+(\.\d+)?/);
        const discount = parseFloat(discountText);
        const totalAmount = parseFloat(
          document
            .getElementById("cart-total")
            .textContent.trim()
            .replace("₹", "")
        );
        const selectedCoupon =
          document.getElementById("selected-coupon").textContent;
        if (!form) {
          throw new Error("couldn't find billing form");
        }
        // get address input value
        const selectedAddress = form.querySelector(
          "input[name='address']:checked"
        );
        if (!selectedAddress) {
          document.getElementById("addressError").classList.remove("d-none");
          isValid = false;
          return;
        }
        document.getElementById("addressError").classList.add("d-none");
        isValid = true;
        if (!selectedAddress.value) {
          throw new Error("couldn't find address id in address element");
        }
        // Validate payment option selection
        const selectedPayment = form.querySelector(
          "input[name='payment']:checked"
        );
        if (!selectedPayment) {
          document
            .getElementById("paymentOptionError")
            .classList.remove("d-none");
          isValid = false;
          return;
        }
        console.log("payment option", selectedPayment.value);
        document.getElementById("paymentOptionError").classList.add("d-none");
        isValid = true;

        if (!selectedPayment.value) {
          throw new Error("couldn't find payment method in element value");
        }

        if (isValid && subtotal && totalAmount && discount >= 0) {
          const orderData = {
            addressId: selectedAddress.value,
            paymentMethod: selectedPayment.value,
            subtotal,
            discount,
            totalAmount,
            couponCode: selectedCoupon || "",
          };

          // Add existingOrderId to orderData if available
          if (existingOrderId) {
            orderData.existingOrderId = existingOrderId;
          }

          if (selectedPayment.value === "Cash on Delivery") {
            await fetch("/cart/checkout/place_order", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(orderData),
            })
              .then((res) => res.json())
              .then((data) => {
                console.log(data.message);
                if (data.error) {
                  return showSuccessMsg(data.error, false);
                }
                const { orderId } = data;
                document.getElementById("orderId").textContent = orderId;
                document
                  .getElementById("order-placed-successBox")
                  .classList.remove("d-none");
                document.getElementById("overlay").classList.remove("d-none");
                clearCartItems();
              })
              .catch((err) => {
                console.error(err);
              });
          } else if (selectedPayment.value === "rzp") {
            console.log("Initiating Razorpay payment");
            const response = await fetch("/cart/checkout/place_order", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(orderData),
            });

            const data = await response.json();

            if (response.status === 500) {
              throw new Error(data.error);
            }
            if (data.error) {
              showSuccessMsg(data.error, false);
            }
            const {
              orderId,
              changedOrderData,
              razorpayOrderId,
              razorpayKey,
              amount,
              currency,
            } = data;
            const userData = document.getElementById("userData").value;
            const options = {
              key: razorpayKey,
              amount,
              currency,
              order_id: razorpayOrderId,
              name: "Stylify",
              description: "Purchase Description",

              async handler(response) {
                if (response.razorpay_payment_id) {
                  console.log("Payment successful: ", response);
                  const result = await updatePaymentStatus(
                    orderId,
                    response.razorpay_payment_id,
                    "Success",
                    changedOrderData
                  );
                  if (result) {
                    clearCartItems();
                    document.getElementById("orderId").textContent = orderId;
                    document
                      .getElementById("order-placed-successBox")
                      .classList.remove("d-none");
                    document
                      .getElementById("overlay")
                      .classList.remove("d-none");
                  } else {
                    console.error("Failed to update payment status");
                  }
                } else {
                  console.log("Payment failed: ", response);
                }
              },
              prefill: {
                name: userData.userName,
                email: userData.email,
                contact: userData.mobile,
              },
              notes: {
                address: "User Address",
              },
              theme: {
                color: "#007bff",
              },
            };

            const razorpayInstance = new Razorpay(options);
            razorpayInstance.open();
          }
        }
      } catch (err) {
        console.error("place order error: ", err);
      }
    });
  }

  // ----------------------------------------------------------------------------------------------
  // forgot password email form validation
  const forgotPassEmailForm = document.getElementById("forgotPass-email-form");
  if (forgotPassEmailForm) {
    forgotPassEmailForm.addEventListener("submit", async (event) => {
      const email = document.getElementById("email");
      const emailError = document.getElementById("emailError");
      event.preventDefault();
      window.localStorage.removeItem("otpTimer");
      if (!email.value.trim()) {
        email.classList.add("is-invalid");
        event.preventDefault();
      } else if (
        !/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email.value.trim())
      ) {
        event.preventDefault();
        email.classList.add("is-invalid");
        emailError.textContent = "*Invalid email address";
      } else {
        email.classList.remove("is-invalid");
      }

      // check the email address is correct
      await fetch("/forgot_password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.value }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            console.log(data);
            emailError.textContent = data.error;
            email.classList.add("is-invalid");
          } else if (data.otpRequired) {
            document.getElementById("otp-section").classList.remove("d-none");
            document.getElementById("overlay").classList.remove("d-none");
            startTimer();
          }
        })
        .catch((err) => {
          console.error("Error:", err);
        });
    });
  }

  // Reset password form submission
  const resetPassForm = document.getElementById("reset_pass_form");
  if (resetPassForm) {
    resetPassForm.addEventListener("submit", (event) => {
      console.log("reset password form submitted");
      const passwordInput = document.getElementById("password");
      const conformPassInput = document.getElementById("conformPassword");
      const passwordError = document.getElementById("passwordError");
      const conformPassError = document.getElementById("conformPassError");
      let isValid = true;

      if (passwordInput.value.trim()) {
        const password = passwordInput.value;
        if (!/^\S*$/.test(password)) {
          isValid = false;
          passwordInput.classList.add("is-invalid");
          passwordError.textContent = "*Password should not contain spaces";
        } else if (!/^.{8,}$/.test(password)) {
          isValid = false;
          passwordInput.classList.add("is-invalid");
          passwordError.textContent = "*Password must be at least 8 characters";
        } else if (!/^(?=.*[A-Z])(?=.*[0-9]).*$/.test(password)) {
          isValid = false;
          passwordInput.classList.add("is-invalid");
          passwordError.textContent =
            "*Password should contain at least one uppercase letter and one number";
        } else {
          passwordInput.classList.remove("is-invalid");
          passwordError.textContent = "";
        }
      } else {
        isValid = false;
        passwordInput.classList.add("is-invalid");
        passwordError.textContent = "*Please enter your password";
      }

      if (conformPassInput.value.trim() && isValid) {
        if (passwordInput.value.trim() !== conformPassInput.value.trim()) {
          event.preventDefault();
          isValid = false;
          passwordInput.classList.add("is-invalid");
          conformPassInput.classList.add("is-invalid");
          conformPassError.textContent = "*Passwords do not match";
        } else {
          conformPassInput.classList.remove("is-invalid");
          conformPassError.textContent = "";
        }
      } else {
        isValid = false;
        conformPassInput.classList.add("is-invalid");
      }

      if (!isValid) {
        event.preventDefault();
      }
    });
  }

  // manage wishlist items
  const favBtn = document.getElementById("fav-btn");
  const favIcon = document.getElementById("favIcon");
  if (favBtn && favIcon) {
    const { proId } = document.getElementById("fav-btn").dataset;

    favBtn.addEventListener("click", async (event) => {
      event.stopPropagation();
      try {
        if (!proId) {
          throw new Error("couldn't find product ID");
        }
        console.log("favBtn clicked");
        favIcon.classList.toggle("favColor");
        await fetch("/view/wishlist_management", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ productId: proId }),
        })
          .then((res) => {
            if (res.status === 401) {
              return res.json().then((data) => {
                console.log(data);
                window.location.href = data.redirectTo;
              });
            }
            return res.json();
          })
          .then((data) => {
            if (data.message) {
              console.log("wishlist update success");
              showSuccessMsg(data.message);
            } else if (data.error) {
              throw new Error(data.message);
            }
          });
      } catch (err) {
        console.error("Wishlist product managing error", err);
      }
    });
  }

  // Remove wishlist item
  const wishItemRemoveBtn = document.querySelectorAll(".wishlist-item-remove");
  if (wishItemRemoveBtn) {
    wishItemRemoveBtn.forEach((item) => {
      item.addEventListener("click", async (e) => {
        try {
          const { productId } = e.target.closest(".wish-product").dataset;
          console.log("pro ID:", productId);
          await fetch("/view/wishlist_management", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              purpose: "DELETE",
              productId,
            }),
          })
            .then((res) => {
              if (res.status === 401) {
                return res.json().then((data) => {
                  console.log(data);
                  window.location.href = data.redirectTo;
                });
              }
              return res.json();
            })
            .then((data) => {
              if (data.message) {
                console.log("wishlist update success");
                showSuccessMsg(data.message);
                e.target.closest(".wish-product").remove();
              } else if (data.error) {
                throw new Error(data.message);
              }
            });
        } catch (err) {
          console.error("remove wishlist item error: ", err.message);
        }
      });
    });
  }

  // -----------------------------------------------------------------------------------------------

  // regex validation
  function RegexValidation(fieldId, regex, errorMessage) {
    try {
      const fieldValue = document.getElementById(fieldId).value;
      return {
        isValid: regex.test(fieldValue),
        errorMessage,
      };
    } catch (err) {
      console.log(`regex validation Error: ${err}`);
      return {
        isValid: false,
        errorMessage: "An error occurred during validation",
      };
    }
  }

  // user registration form input field error display
  function displayError(errorFieldId, errorMessage) {
    try {
      document.getElementById(errorFieldId).textContent = errorMessage;
      console.log("error displayed");
    } catch (err) {
      console.log(`userReg input field error display function Eroro: ${err}`);
    }
  }

  function resetErrors() {
    try {
      const errorElements = document.getElementsByClassName("invalid-feedback");
      const inputField = document.querySelectorAll(".signup-input");
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < errorElements.length; i++) {
        errorElements[i].textContent = "";
        inputField[i].classList.remove("is-invalid");
      }
    } catch (err) {
      console.log(`input field Error reset function Error: ${err}`);
    }
  }

  // -----------------------------------------------------------------------------------------------

  // OTP part
  // call otp timer function if the otp section visible
  const otpSection = document.getElementById("otp-section");
  if (otpSection && !otpSection.classList.contains("d-none")) {
    console.log(otpSection);
    startTimer();
  }

  // -----------------------------------------------------------------------------------------------

  // checkout page check COD option available?
  const orderTotalAmount = document.getElementById("cart-total").textContent;
  const CODOption = document.getElementById("COD-option-container");
  const CodDisabledMsg = document.getElementById("COD-disabled-msg");
  if (orderTotalAmount && CODOption && CodDisabledMsg) {
    // eslint-disable-next-line no-use-before-define
    updateCODAvailability(orderTotalAmount);
  }

  // checkout page coupon section
  const couponBtn = document.getElementById("coupon-btn");
  const couponContainer = document.getElementById("coupon-container");
  const couponList = document.getElementById("coupon-list");
  if (couponBtn && couponContainer) {
    const totalAmount = parseFloat(
      document.getElementById("cart-total").textContent
    );
    const url = `/cart/checkout/getCoupons?tAmount=${totalAmount}`;
    couponBtn.addEventListener("click", async () => {
      try {
        await fetch(url)
          .then((res) => res.json())
          .then((data) => {
            if (data.message) {
              console.log(data.message);
              couponList.innerHTML = "";
              const li = document.createElement("li");
              li.innerHTML = `
                      <div>
                          <p class="m-0 text-sample3 text-danger  ">${data.message}</p>
                      </div>
                  `;
              couponList.appendChild(li);
            } else if (data.length > 0) {
              const coupons = data;
              // Clear existing coupons
              couponList.innerHTML = "";
              // Populate the coupon list
              coupons.forEach((coupon) => {
                const li = document.createElement("li");
                li.innerHTML = `
                        <div>
                        <span class="dis-percentage"><strong>${coupon.discountPercentage}% off</strong></span>
                            <span class="coupon-code ml-4 px-2">${coupon.couponCode}</span>
                            <p class="m-0 text-sample3">Expires: ${coupon.expirationDate}</p>
                        </div>
                        <button class="coupon-apply-btn btn-success text-sample3" onclick="applyCoupon(this)">Apply</button>
                    `;
                couponList.appendChild(li);
              });
            }
          })
          .catch((err) => {
            throw new Error(err);
          });
        const isOpen = couponContainer.classList.contains("open");
        if (isOpen) {
          couponContainer.style.height = "0"; // Close the container
          couponContainer.classList.remove("open");
          couponBtn.classList.remove("open");
        } else {
          const containerHeight = `${couponContainer.scrollHeight}px`;
          couponContainer.style.height = containerHeight; // Open the container
          couponContainer.classList.add("open");
          couponBtn.classList.add("open");
        }
      } catch (err) {
        console.error("check out page coupon display error: ", err);
      }
    });
  }
});

// DOM load close
// -----------------------------------------------------------------------------------------------
let appliedCouponDiscount = 0;

function applyCoupon(button) {
  const couponBtn = document.getElementById("coupon-btn");
  const couponContainer = document.getElementById("coupon-container");
  const listItem = button.parentNode;
  const discountElement = document.getElementById("cart-discount");
  const shippingCharge = document.getElementById("shipping-charge");

  const currentDiscount = parseFloat(
    discountElement.textContent.replace("-", "")
  );
  const totalAmountElement = document.getElementById("cart-total");
  const totalAmount = parseFloat(
    document.getElementById("cart-total").textContent
  );
  const discountPercentageText =
    listItem.querySelector(".dis-percentage").textContent;
  const discountPercentage = parseFloat(discountPercentageText.match(/\d+/)[0]);
  const couponCode = listItem.querySelector(".coupon-code").textContent;
  // close the coupon container
  if (couponContainer && couponBtn) {
    couponContainer.style.height = "0"; // Close the container
    couponContainer.classList.remove("open");
    couponBtn.classList.remove("open");
  }
  // calculate discount
  const discountAmount = (totalAmount * discountPercentage) / 100;
  const totalDiscount = currentDiscount + discountAmount;
  appliedCouponDiscount = discountAmount;
  let newTotalAmount = totalAmount - discountAmount;

  // update shipping charge based on total amount
  if (newTotalAmount < 1000) {
    shippingCharge.innerHTML = `<i class="bx bx-rupee bx-xs"></i>${40}`;
    newTotalAmount += 40;
  } else {
    shippingCharge.innerHTML = "Free";
  }
  // update discount
  discountElement.innerHTML = `-<i class="bx bx-rupee bx-xs"></i>${totalDiscount.toFixed(2)}`;
  // update total amount
  totalAmountElement.innerHTML = `<i class="bx bx-rupee bx-xs"></i>${newTotalAmount.toFixed(2)}`;

  // update COD availability based on total amount
  updateCODAvailability(newTotalAmount);
  // hide coupon drop down section
  document.querySelector(".coupon-section").classList.add("d-none");
  // show selected coupon code
  document
    .querySelector(".selected-coupon-container")
    .classList.remove("d-none");
  document.getElementById("selected-coupon").textContent = couponCode;
}

// remove selected coupon
function removeCoupon() {
  const discountElement = document.getElementById("cart-discount");
  const shippingCharge = document.getElementById("shipping-charge");
  const subtotal = parseFloat(
    document.getElementById("cart-subtotal").textContent
  );
  const currentDiscount = parseFloat(
    discountElement.textContent.replace("-", "")
  );
  const totalAmountElement = document.getElementById("cart-total");
  const totalAmount = parseFloat(
    document.getElementById("cart-total").textContent
  );
  const totalDiscount = currentDiscount - appliedCouponDiscount;
  // let newTotalAmount = totalAmount + appliedCouponDiscount;
  let newTotalAmount = subtotal + totalDiscount;
  // update shipping charge based on total amount
  if (newTotalAmount < 1000) {
    shippingCharge.innerHTML = `<i class="bx bx-rupee bx-xs"></i>${40}`;
    newTotalAmount += 40;
  } else {
    shippingCharge.innerHTML = "Free";
  }
  discountElement.innerHTML = `-<i class="bx bx-rupee bx-xs"></i>${totalDiscount.toFixed(2)}`;
  totalAmountElement.innerHTML = `<i class="bx bx-rupee bx-xs"></i>${newTotalAmount.toFixed(2)}`;
  appliedCouponDiscount = 0;
  // update COD availability based on total amount
  updateCODAvailability(newTotalAmount);
  // Remove the selected coupon
  document.querySelector(".selected-coupon-container").classList.add("d-none");
  // show coupon drop down section
  document.querySelector(".coupon-section").classList.remove("d-none");
}

// -----------------------------------------------------------------------------------------------

// close otp section when click (x) icon

// eslint-disable-next-line no-unused-vars
function closeOtpModal() {
  console.log("closeOTP function called");
  try {
    document.getElementById("otp-section").style.display = "none";
    document.querySelector(".overlay").style.display = "none";
  } catch (err) {
    console.log(`Close OTP section function Error: ${err}`);
  }
}

// OTP Timer setup
let countdown;
function startTimer() {
  let timer = localStorage.getItem("otpTimer") || 300;
  if (!timer) {
    timer = 300; // 5 minutes in seconds
    localStorage.setItem("otpTimer", timer);
  }

  countdown = setInterval(() => {
    if (timer <= 0) {
      clearInterval(countdown);
      document.getElementById("otp-error").textContent =
        "Sorry, the OTP has expired. Please request a new one";
      // Reset the timer to 5 minutes after expiration
      timer = 300;
      localStorage.setItem("otpTimer", timer);
    } else {
      // eslint-disable-next-line no-plusplus
      timer--;
      localStorage.setItem("otpTimer", timer);
      displayTimer(timer);
    }
  }, 1000);
}
// display the timer in otp section
function displayTimer(time) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  document.getElementById("timer").textContent = formattedTime;
}

// when click OTP resend link
// eslint-disable-next-line no-unused-vars
async function WhenOtpResend(element, ms, event) {
  try {
    event.preventDefault();

    const otpResendMsg = document.getElementById("otp-resend-msg");

    if (element && ms && otpResendMsg) {
      element.classList.add("disabled");

      const response = await fetch("/resend_otp", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      console.log(data);
      if (data.success) {
        console.log(data.message);
        otpResendMsg.classList.remove("d-none");
        document.getElementById("otp-error").textContent = "";
        // Clear the existing timer
        clearInterval(countdown);
        // setting otpTimer for restart timer when calling startTimer function
        localStorage.setItem("otpTimer", 300);
        startTimer();
        setTimeout(() => {
          otpResendMsg.classList.add("d-none");
          element.classList.remove("disabled");
        }, ms);
      } else {
        console.log(data.message);
        element.classList.remove("disabled");
      }
    }
  } catch (err) {
    console.error(err.message);
  }
}
// -------------------------------------------------------------------------------------------------

function displayConformation(element, event, message, path) {
  try {
    console.log("display conformation called");
    event.preventDefault();
    const confirmationDialog = document.getElementById("confirmationDialog");
    const conformMessage = document.getElementById("conform-message");
    if (confirmationDialog && conformMessage) {
      showConfirmationDialog(confirmationDialog);
      conformMessage.textContent = message;
    }
    const confirmButton = document.getElementById("confirmButton");
    const cancelButton = document.getElementById("cancelButton");
    if (confirmationDialog && confirmButton && cancelButton) {
      confirmButton.addEventListener("click", () => {
        console.log("path:", path);
        window.location.href = path;
        hideConfirmationDialog(confirmationDialog);
      });

      // Handle cancel button click
      cancelButton.addEventListener("click", () => {
        hideConfirmationDialog(confirmationDialog);
      });
    }
  } catch (err) {
    console.error(err);
  }
}

function showConfirmationDialog(elemet) {
  elemet.classList.remove("d-none");
}

// Hide the confirmation dialog
function hideConfirmationDialog(elemet) {
  elemet.classList.add("d-none");
}

// -------------------------------------------------------------------------------------------------

// pagination functionality
const pagination = document.getElementById("pagination");
if (pagination) {
  const urlParams = new URLSearchParams(window.location.search);
  const currentPage = parseInt(urlParams.get("page"), 10) || 1;
  const prevPageBtn = document.getElementById("prevPageBtn");
  let prevPage;
  if (currentPage > 1) {
    prevPage = currentPage - 1;
    prevPageBtn.classList.remove("disabled");
  } else {
    prevPageBtn.classList.add("disabled");
  }
  document
    .getElementById("prev-link")
    .setAttribute("href", `?page=${prevPage}`);

  // add active class to pagination box if the page is match
  const pageNumbers = document.querySelectorAll(".page-number");
  if (pageNumbers) {
    pageNumbers.forEach((pageNumber) => {
      const number = parseInt(pageNumber.textContent, 10);
      if (number === currentPage) {
        pageNumber.classList.add("active");
      }
    });
  }
  // pagination next button
  const totalPage = pageNumbers.length;
  const nextBtn = document.getElementById("nextBtn");
  let nextPage;
  if (currentPage < totalPage) {
    nextPage = currentPage + 1;
  } else {
    nextBtn.classList.add("disabled");
  }
  document
    .getElementById("next-link")
    .setAttribute("href", `?page=${nextPage}`);
}

// -------------------------------------------------------------------------------------------------

// show success message
function showSuccessMsg(msg, status = true) {
  // the "status" using for checking the message error or success
  try {
    const successMsgBox = document.getElementById("successMsgBox");
    if (!successMsgBox) {
      throw new Error(
        "successMsgBox not found, please add successMsgBox in the page"
      );
    }

    // Remove any existing message boxes
    successMsgBox.innerHTML = "";

    const msgBox = document.createElement("div");
    msgBox.classList.add("msgBox");
    // msgBox.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #00c853;"></i>${msg}`;
    console.log(status);
    msgBox.innerHTML =
      status === false
        ? `<i class="fa-solid fa-circle-exclamation" style="color: #c80000;"></i>${msg}`
        : `<i class="fa-solid fa-circle-check" style="color: #00c853;"></i>${msg}`;
    successMsgBox.appendChild(msgBox);

    setTimeout(() => {
      msgBox.classList.add("show");
    }, 50);

    // Remove the message box after 5 seconds
    setTimeout(() => {
      msgBox.style.transform = "translateY(100%)";
      setTimeout(() => {
        msgBox.remove();
      }, 500);
    }, 5000);
  } catch (err) {
    console.error("display success message error: ", err.message);
  }
}

// -------------------------------------------------------------------------------------------------
// update cartItem quantity
async function updateCartItemQty(productId, quantity) {
  try {
    const response = await fetch(`/update_cartItem_qty/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quantity }),
    });

    if (response.ok) {
      console.log("cart item quantity updated");

      // Update subtotal
      updateSubtotal();
      return true;
    }
    const error = await response.json();
    if (error.noStock) {
      console.error(error.noStock);
      showSuccessMsg(error.noStock, false);
      return false;
    }
    throw new Error("Failed to update cart item quantity");
  } catch (err) {
    console.error("updating cart item quantity error: ", err.message);
  }
}

// update cart summery subtotal
async function updateSubtotal() {
  try {
    const subtotalDiv = document.getElementById("cart-subtotal");
    if (subtotalDiv) {
      const cartItemsResponse = await fetch("/get_cart_items");

      if (cartItemsResponse.ok) {
        const responseData = await cartItemsResponse.json();
        const { cartItems } = responseData;
        const subtotal = cartItems.reduce(
          (acc, item) => acc + item.productId.price * item.quantity,
          0
        );
        console.log("subtotal of cart items : ", subtotal);
        subtotalDiv.innerHTML = `<i class="bx bx-rupee bx-xs"></i>${subtotal}`;

        // update discount amount
        updateCartDiscount(cartItems);
        // update total amount
        updateTotal(subtotal, cartItems);
      } else {
        throw new Error("Failed to fetch cart items");
      }
    }
  } catch (err) {
    console.error("update cart subtotal error: ", err.message);
  }
}

// update cart summery total amount
async function updateTotal(subtotal, cartItems) {
  try {
    const cartTotal = document.getElementById("cart-total");
    const shippingCharge = document.getElementById("shipping-charge");
    if (cartTotal) {
      let total = cartItems.reduce(
        (acc, item) => acc - item.productId.discount,
        subtotal
      );
      if (total < 1000) {
        shippingCharge.innerHTML = `<i class="bx bx-rupee bx-xs"></i>${40}`;
        total += 40;
      } else {
        shippingCharge.innerHTML = "Free";
      }
      cartTotal.innerHTML = `<i class="bx bx-rupee bx-xs"></i>${total}`;
    }
  } catch (err) {
    console.error("updating cart summery total amount error: ", err.message);
  }
}

// update cart summery discount
async function updateCartDiscount(cartItems) {
  try {
    const cartDiscount = document.getElementById("cart-discount");
    if (cartDiscount) {
      const discount = cartItems.reduce(
        (acc, item) => acc + item.productId.discount * item.quantity,
        0
      );
      cartDiscount.innerHTML = `-<i class="bx bx-rupee bx-xs"></i>${discount}`;
    }
  } catch (err) {
    console.log("cart discount update error: ", err.message);
  }
}
// -------------------------------------------------------------------------------------------------
// show and hide user profile page side bar
// eslint-disable-next-line no-unused-vars
function toggleSidebar() {
  console.log("toggleSidebar called");
  const sidebar = document.getElementById("sidebar-col");
  sidebar.classList.toggle("d-none");
}

// -------------------------------------------------------------------------------------------------
// password hide/show toggle function
// eslint-disable-next-line no-unused-vars
function togglePassword(event) {
  try {
    const passwordInput = event.target.previousElementSibling;
    const toggleIcon = event.target;
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      toggleIcon.classList.add("fa-eye");
      toggleIcon.classList.remove("fa-eye-slash");
    } else {
      passwordInput.type = "password";
      toggleIcon.classList.add("fa-eye-slash");
      toggleIcon.classList.remove("fa-eye");
    }
  } catch (err) {
    console.log(`password toggle error: ${err.message}`);
  }
}
// -------------------------------------------------------------------------------------------------
// zoom product main image
// eslint-disable-next-line no-unused-vars
function zoomProduct(event) {
  const mainImg = document.getElementById("main-img");
  const mainImgDiv = document.getElementById("main-img-div");

  if (!mainImg || !mainImgDiv) {
    console.error("Couldn't find mainImg or mainImgDiv element.");
  }
  // mainImgDiv.addEventListener("click", (event) => {
  console.log("zoom image triggered");
  try {
    const cursorX = event.clientX - mainImgDiv.getBoundingClientRect().left;
    const cursorY = event.clientY - mainImgDiv.getBoundingClientRect().top;

    // Calculate the scale based on the cursor position
    const scale =
      mainImg.style.transform === "scale(4)" ? "scale(1)" : "scale(4)";

    // Apply the appropriate transform based on the zoom state and cursor position
    mainImg.style.transformOrigin = `${cursorX}px ${cursorY}px`;
    mainImg.style.transform = scale;
    if (scale === "scale(4)") {
      // eslint-disable-next-line no-shadow
      mainImgDiv.addEventListener("mousemove", (event) =>
        moveImage(event, cursorX, cursorY, mainImg)
      );
    } else {
      mainImgDiv.removeEventListener("mousemove", () => moveImage);
      mainImg.style.right = "auto";
      mainImg.style.bottom = "auto";
      mainImg.style.cursor = "zoom-in";
    }
  } catch (err) {
    console.log(`product image zooming function Error: ${err}`);
  }
}
// function for move image when zoom in
function moveImage(event, cursorX, cursorY, mainImg) {
  if (mainImg.style.transform === "scale(4)") {
    const moveX = event.clientX - cursorX;
    const moveY = event.clientY - cursorY;
    mainImg.style.right = `${moveX}px`;
    mainImg.style.bottom = `${moveY}px`;
  }
}

// home page filtering and sorting
function filterCategory(event, categoryId) {
  event.preventDefault();
  const currentUrl = window.location.href;
  const url = new URL(currentUrl);
  url.searchParams.set("category", categoryId);
  window.location.href = url.toString();
}
function filterByPrice(event, range) {
  event.preventDefault();
  const currentUrl = window.location.href;
  const url = new URL(currentUrl);
  if (range === "all") {
    url.searchParams.delete("price");
  } else {
    url.searchParams.set("price", range);
  }
  window.location.href = url.toString();
}
function updateSort(event, sortType) {
  event.preventDefault();
  const currentUrl = window.location.href;
  const url = new URL(currentUrl);
  url.searchParams.set("sort", sortType);
  window.location.href = url.toString();
}

// -------------------------------------------------------------------------------------------------
// update order payment status
async function updatePaymentStatus(
  orderId,
  paymentId,
  status,
  changedOrderData,
) {
  try {
    if (!paymentId || !status || !orderId) {
      throw new Error("PaymentId or status or orderId is missing");
    }

    const response = await fetch("/update_order_paymentStatus", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId, paymentId, status, changedOrderData }),
    });

    if (!response.ok) {
      throw new Error("Failed to update payment status");
    }

    const data = await response.json();
    if (data.message === "Payment status updated successfully") {
      console.log(data.message);
      return true;
    }

    throw new Error("Failed to update payment status");
  } catch (err) {
    console.error(err);
    return false;
  }
}

// clear cart items
async function clearCartItems() {
  try {
    await fetch("/remove_from_cart/all", {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data.message);
      })
      .catch((err) => {
        console.error(err);
      });
  } catch (err) {
    console.error("cart items clearing error: ", err);
  }
}

function updateCODAvailability(totalAmount) {
  const CODOption = document.getElementById("COD-option-container");
  const CodDisabledMsg = document.getElementById("COD-disabled-msg");
  if (parseFloat(totalAmount) > 1000) {
    CODOption.classList.add("disabled");
    CodDisabledMsg.classList.remove("d-none");
  } else {
    CODOption.classList.remove("disabled");
    CodDisabledMsg.classList.add("d-none");
  }
}
