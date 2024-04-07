/* eslint-disable no-underscore-dangle */
/* eslint-disable no-plusplus */
/* eslint-disable no-use-before-define */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

document.addEventListener("DOMContentLoaded", () => {
  // admin login validation done in index.js file

  // admin login field empty validation
  const adminSigninForm = document.getElementById("admin-signin-form");
  if (adminSigninForm) {
    adminSigninForm.addEventListener("submit", (event) => {
      const usernameInput = document.getElementById("username");
      const passwordInput = document.getElementById("password");

      // Check if the username is empty
      if (!usernameInput.value.trim()) {
        usernameInput.classList.add("is-invalid");
        event.preventDefault();
      } else {
        usernameInput.classList.remove("is-invalid");
      }

      // Check if the password is empty
      if (!passwordInput.value.trim()) {
        passwordInput.classList.add("is-invalid");
        event.preventDefault();
      } else {
        passwordInput.classList.remove("is-invalid");
      }
    });
  }

  // preview category image after took from local storage
  const categImageUpload = document.getElementById("imageUpload");
  const imagePreview = document.getElementById("imagePreview");

  if (categImageUpload && imagePreview) {
    categImageUpload.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          // Create an image element
          const img = document.createElement("img");
          imagePreview.classList.remove("d-none");
          img.src = e.target.result;
          img.alt = "Category Image";
          img.style.maxWidth = "100%";
          img.style.maxHeight = "100%";
          // Clear previous content and append the new image
          imagePreview.innerHTML = "";
          imagePreview.appendChild(img);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // delete the image that selected for category
  const deleteImageButton = document.getElementById("cancel-icon");
  if (deleteImageButton) {
    deleteImageButton.addEventListener("click", () => {
      document.getElementById("imageUpload").value = "";
      document.getElementById("imagePreview").classList.add("d-none");
    });
  }
  // -----------------------------------------------------------------------------------
  // Adding new category
  const addCategoryForm = document.getElementById("Add-category-form");

  if (addCategoryForm) {
    let isValid = true;
    addCategoryForm.addEventListener("submit", async (event) => {
      try {
        event.preventDefault();
        const name = document.getElementById("category-name").value.trim();
        const description = document.getElementById("description").value.trim();
        const imageFile = document.getElementById("imageUpload").files[0];
        console.log("imageFile", imageFile);
        // category name validation

        const pattern = /^[a-zA-Z0-9\s-]+$/;
        if (!name) {
          isValid = false;
          event.preventDefault();
          nameError.textContent = "*Category name is required";
        } else if (name.length < 3 || name.length > 20) {
          isValid = false;
          event.preventDefault();
          nameError.textContent =
            "Category name must be between 3 and 20 characters long";
        } else if (!pattern.test(name)) {
          isValid = false;
          event.preventDefault();
          console.log("pattern checked");
          nameError.classList.remove("d-none");
          nameError.textContent =
            "Category name can only contain letters, numbers, spaces, and dashes";
          return;
        } else {
          isValid = true;
          nameError.textContent = "";
        }
        // validate imageFile
        const formAction = document.getElementById("formAction"); // A hidden input field for indicate this is for product editing
        if (!imageFile && !formAction) {
          event.preventDefault();
          imageUploadError.classList.remove("d-none");
        } else {
          imageUploadError.classList.add("d-none");
        }
        // Description validation

        if (description) {
          if (description.length < 10 || description.length > 500) {
            event.preventDefault();
            descriptionError.textContent =
              "*Description must be between 10 and 500 characters long";
          } else {
            descriptionError.textContent = "";
          }
        }
        console.log("all category validation passed");
        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("image", imageFile);

        console.log(
          "after taking all category data to formData variable",
          formData
        );
        if (isValid) {
          // checking the form submission for adding or editing
          let actionUrl = "";
          let response;
          if (formAction && formAction.value === "edit") {
            const { categoryId } = formAction.dataset;
            console.log("this is category id for update", categoryId);
            actionUrl = `/category/edit_category/${categoryId}`;
            response = await fetch(actionUrl, {
              method: "PATCH",
              body: formData,
            });
          } else {
            actionUrl = "/addCategory";
            response = await fetch(actionUrl, {
              method: "POST",
              body: formData,
            });
          }
          console.log("this is form Action", formAction);

          const successPara = document.getElementById("category-msg");
          if (response.ok) {
            const data = await response.json();
            console.log(data);
            // eslint-disable-next-line no-use-before-define
            // updateTable(data.category);
            window.location.href = "/category";
          } else {
            const responseData = await response.json(); // If server returns error details
            nameError.textContent = responseData.error;
            console.error("Failed to add category:", responseData.error);
          }
        } else {
          event.preventDefault();
        }
      } catch (err) {
        console.error("Error while adding category:", err);
      }
    });
  }
  function updateTable(category) {
    const tableBody = document
      .getElementById("category-table")
      .getElementsByTagName("tbody")[0];
    const newRow = tableBody.insertRow();
    const cell1 = newRow.insertCell(0); // Create cells for each column
    const cell2 = newRow.insertCell(1);
    const cell3 = newRow.insertCell(2);

    // Populate the cells with category data
    console.log(category.image);
    const imagePath = category.image.replace(/public\\/, "/");
    console.log(imagePath);

    cell1.textContent = category.name;
    cell2.innerHTML = `<img src="${imagePath}" alt="${category.name}" style="width: 100%;">`;
    cell3.textContent = category.description;
  }

  // -----------------------------------------------------------------------------------------------

  // Display product preview images

  const selectedProductImages = [];
  const proImageUpload = document.getElementById("imageUpload");
  if (proImageUpload) {
    proImageUpload.addEventListener("change", (event) => {
      const { files } = event.target;
      const imagePreviewsContainer = document.getElementById("imagePreviewRow");

      const currentPreviewsCount =
        imagePreviewsContainer.querySelectorAll(".image-preview").length;
      const remainingPreviewsCount = Math.max(5 - currentPreviewsCount, 0);

      // Limit the number of previews to a maximum of five
      const maxPreviews = Math.min(files.length, remainingPreviewsCount);
      if (files.length > 5) {
        event.preventDefault();
        imageUploadError.textContent = "You can only select up to 5 images";
        return;
      }
      imageUploadError.textContent = "";

      // Loop through selected files and create image previews
      for (let i = 0; i < maxPreviews; i++) {
        const file = files[i];
        const reader = new FileReader();

        // add selected images to an array
        selectedProductImages.push(file);
        console.log(
          "after adding the product images to array",
          selectedProductImages
        );
        reader.onload = function (e) {
          // Create image preview container
          const imagePreviewContainer = document.createElement("div");
          imagePreviewContainer.classList.add("col-md-6");

          // Create image preview element
          // eslint-disable-next-line no-shadow
          const imagePreview = document.createElement("div");
          imagePreview.classList.add(
            "image-preview",
            "d-flex",
            "justify-content-center",
            "align-items-center"
          );
          imagePreview.style.backgroundImage = `url('${e.target.result}')`;

          // create image cancel icon on image preview box
          const deleteIcon = document.createElement("i");
          deleteIcon.classList.add(
            "fa-solid",
            "fa-circle-xmark",
            "delete-icon"
          );
          deleteIcon.style.color = "#e20001";
          deleteIcon.title = "Cancel";
          deleteIcon.dataset.imgId = `img-${i + 1}`; // Setting unique img id

          // Append delete icon to image preview container
          imagePreviewContainer.appendChild(deleteIcon);

          // Append image preview to container
          imagePreviewContainer.appendChild(imagePreview);

          // Append container to row
          imagePreviewsContainer.appendChild(imagePreviewContainer);
        };

        reader.readAsDataURL(file);
      }
    });
  }

  // Attach event listener to delete icons
  document.addEventListener("click", async (event) => {
    if (event.target && event.target.classList.contains("delete-icon")) {
      const formAction = document.getElementById("formAction")?.value;
      const clickedIcon = event.target;
      const parentContainer = clickedIcon.parentNode;
      console.log(formAction);
      const imageIndex = parseInt(clickedIcon.dataset.imgId, 10);
      if (formAction === "edit" && !isNaN(imageIndex)) {
        const productId = document.getElementById("product_id").value;
        console.log("image index", imageIndex);
        console.log("image index", imageIndex);
        try {
          console.log("calling fetch");
          const response = await fetch(
            `/product_management/editProduct/${productId}/deleteImage/${imageIndex}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            console.log(data.message);
            // If the image is successfully deleted, remove the parent container
            parentContainer.remove();
            // Update the selectedProductImages array by removing the image at the specified index
            selectedProductImages.splice(imageIndex, 1);
            console.log("Image removed from array:", selectedProductImages);
            const remainingPreviews = document.querySelectorAll(".delete-icon");
            remainingPreviews.forEach((deleteIcon, index) => {
              deleteIcon.dataset.imgId = index;
            });
          } else {
            const errorMessage = await response.json();
            // Handle error if image deletion fails
            console.error("Failed to delete image:", response.statusText);
            console.error(errorMessage.error);
          }
        } catch (error) {
          console.error("Error deleting image:", error.message);
        }
      }
      parentContainer.remove(); // Remove the parent container when delete icon is clicked

      // Get the index of the clicked delete icon
      const index = parseInt(clickedIcon.dataset.imgId.split("-")[1], 10) - 1;

      // Remove the corresponding image from the selectedProductImages array
      selectedProductImages.splice(index, 1);
      console.log("Image removed from array:", selectedProductImages);
    }
  });

  // ------------------------------------------------------------------------------------

  // add product form validation
  const addProductForm = document.getElementById("add-product-form");
  if (addProductForm) {
    addProductForm.addEventListener("submit", async (event) => {
      try {
        event.preventDefault();
        console.log("add product form submitted");
        const proName = document.getElementById("product-name");
        const category = document.getElementById("category");
        const regularPrice = document.getElementById("regular-price");
        const sellingPrice = document.getElementById("selling-price");
        const disAmount = document.getElementById("dis-amount-input");
        const disPercentage = document.getElementById("dis-%-input");
        const description = document.getElementById("description");
        const stockInput = document.getElementById("stock");
        // taking selected images that passed to this array when selecting
        const selectedImgs = selectedProductImages;
        console.log(selectedImgs);
        console.log(selectedImgs.length);

        const formData = {};

        // product name validation
        const pattern = /^[a-zA-Z0-9\s-','.]+$/;
        if (!proName.value.trim()) {
          event.preventDefault();
          proNameError.textContent = "Product name is required";
          return;
        }
        proNameError.textContent = "";

        if (
          proName.value.trim().length < 3 ||
          proName.value.trim().length > 100
        ) {
          event.preventDefault();
          proNameError.textContent =
            "Product name must be between 3 and 100 characters long";
          return;
        }
        proNameError.textContent = "";

        if (!pattern.test(proName.value)) {
          event.preventDefault();
          console.log("pattern checked");
          proNameError.textContent =
            "Product name can only contain letters, numbers, spaces, and dashes";
          return;
        }
        proNameError.textContent = "";
        formData.name = proName.value.trim();

        // category validation
        if (category.value === "0") {
          event.preventDefault();
          categoryError.textContent = "Select a category";
        } else {
          categoryError.textContent = "";
          formData.category = category.value;
        }
        console.log("before reg val");

        // regular price validation
        if (!regularPrice.value.trim()) {
          event.preventDefault();
          regPriceError.textContent = "Regular price is required";
          return;
        }
        proNameError.textContent = "";

        if (regularPrice.value.trim()) {
          const price = parseFloat(regularPrice.value.trim());
          if (Number.isNaN(price)) {
            event.preventDefault();
            regPriceError.textContent = "Please enter a valid number";
          } else if (price <= 0) {
            event.preventDefault();
            regPriceError.textContent = "Price must be greater than zero";
          } else if (price > 10000) {
            event.preventDefault();
            regPriceError.textContent =
              "Product price should not exceed ₹10000";
            return;
          } else {
            regPriceError.textContent = "";
            formData.regularPrice = regularPrice.value;
          }
        }
        console.log("after reg");

        //  selling price validation

        if (sellingPrice.value) {
          const price = parseFloat(sellingPrice.value);
          if (Number.isNaN(price)) {
            event.preventDefault();
            sellingPriceError.textContent = "Please enter a valid number";
            return;
          }
          sellingPriceError.textContent = "";

          if (price <= 0) {
            event.preventDefault();
            sellingPriceError.textContent = "Price must be greater than zero";
            return;
          }
          sellingPriceError.textContent = "";

          if (price > 10000) {
            event.preventDefault();
            sellingPriceError.textContent =
              "Product price should not exceed ₹10000";
            return;
          }
          sellingPriceError.textContent = "";

          if (price > regularPrice.value) {
            event.preventDefault();
            sellingPriceError.textContent =
              "Selling price should be less than regular price";
            return;
          }
        } else {
          event.preventDefault();
          sellingPriceError.textContent = "Selling price is required";
          if (sellingPrice.value) {
            sellingPriceError.textContent = "";
            formData.price = sellPrice.value;
          }
        }
        formData.price = sellingPrice.value;
        console.log("after selling price val");
        // Discount amount validation
        if (disAmount.value) {
          const sellPrice = sellingPrice.value.trim();
          const amount = parseFloat(disAmount.value);
          if (Number.isNaN(amount)) {
            disError.textContent = "Please enter a valid number";
            return;
          }
          disError.textContent = "";

          if (amount < 0) {
            disError.textContent = "Price must be greater than zero";
            return;
          }
          disError.textContent = "";

          if (amount >= sellPrice) {
            disError.textContent =
              "Discount amount should be less than selling price";
            return;
          }
          disError.textContent = "";
        }
        disError.textContent = "";
        formData.discountAmount = disAmount.value;
        console.log(formData);
        console.log("after discountAmount val");

        // Discount percentage validation
        if (disPercentage.value) {
          const percentage = parseFloat(disPercentage.value);
          if (Number.isNaN(percentage)) {
            disPerceError.textContent = "Please enter a valid number";
          } else {
            disPerceError.textContent = "";
          }
          if (percentage < 0 || percentage > 100) {
            disPerceError.textContent = "% must be between 0 - 100";
          } else {
            disPerceError.textContent = "";
          }
        } else {
          disPerceError.textContent = "";
          formData.discountPercentage = disPercentage.value;
        }
        console.log("after discount val");
        if (stock.value) {
          console.log("stock has value");
          const stock = parseFloat(stockInput.value);
          if (Number.isNaN(stock)) {
            event.preventDefault();
            stockError.textContent = "Please enter a valid number";
            return;
          }
          stockError.textContent = "";

          if (stock <= 0) {
            event.preventDefault();
            stockError.textContent = "stock must be greater than zero";
            return;
          }
          stockError.textContent = "";

          if (stock > 1000) {
            event.preventDefault();
            stockError.textContent =
              "Cannot add more than 1000 units of stock for a product";
            return;
          }
          stockError.textContent = "";
        } else {
          event.preventDefault();
          stockError.textContent = "Stock value is required";
          if (stock.value) {
            stockError.textContent = "";
          }
        }
        formData.stock = parseFloat(stockInput.value);

        // Description validation
        if (description.value) {
          if (
            description.value.trim().length < 10 ||
            description.value.trim().length > 500
          ) {
            descriptionError.textContent =
              "Description must be between 10 and 500 characters long";
          } else {
            console.log("description of the product:", description.value);
            descriptionError.textContent = "";
            formData.description = description.value;
          }
        } else {
          event.preventDefault();
          descriptionError.textContent = "Description is required";
          return;
        }
        console.log("form data is:", formData);
        // product image validation
        const formAction = document.getElementById("formAction"); // A hidden input field for indicate this is for product editing
        if (selectedImgs.length === 0 && !formAction) {
          event.preventDefault();
          imageUploadError.textContent = "Please upload product images";
          return;
        }
        console.log("selected images are:", selectedImgs);
        imageUpload.textContent = "";

        const images = selectedImgs;

        console.log("images:", images);
        console.log(formData);

        const formDataJSON = JSON.stringify(formData);
        console.log(formDataJSON);

        // Create FormData to combine text data and files
        const combinedFormData = new FormData();
        combinedFormData.append("formData", formDataJSON); // Append form data as a JSON string
        console.log(1);
        // Create FormData for files
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          combinedFormData.append("images", image); // Append each image file
        }
        //  Passing the data to back end
        if (
          proName.value &&
          category.value &&
          sellingPrice.value &&
          formData &&
          images
        ) {
          // ------------------------------------------------------

          // checking the form submission for adding or editing
          let actionUrl = "";
          let response = "";
          if (formAction && formAction.value === "edit") {
            const { productId } = formAction.dataset;
            console.log("this is product id for update", productId);
            actionUrl = `/product_management/editProduct/${productId}`;

            response = await fetch(actionUrl, {
              method: "PATCH",
              body: combinedFormData,
            });
            if (response.ok) {
              console.log(response);
              const data = await response.json();
              console.log(data);
              window.location.href =
                "/product_management?success=Product updated successfully";
            } else {
              const responseData = await response.json(); // If server returns error details
              console.error("Failed to add product:", responseData.error);
              proNameError.textContent = responseData.error;
            }
          } else {
            console.log("this is form Action", formAction);
            //  ---------------------------------------------------
            console.log("product data passing to back end");

            response = await fetch("/product_management/add_product", {
              method: "POST",
              body: combinedFormData,
            });
          }

          if (response.ok) {
            console.log(response);
            const data = await response.json();
            console.log(data);
            showSuccessMsg(data.message)
            window.location.reload();
          } else {
            const responseData = await response.json(); // If server returns error details
            console.error("Failed to add product:", responseData.error);
            proNameError.textContent = responseData.error;
          }
        }

        // -----------------------------------------------------------------------------------

        // In product adding page updating input values base on discount
        regularPrice.addEventListener("input", () => {
          updateDiscountPercentage(regularPrice, sellingPrice, disPercentage);
          updateSellingPrice(regularPrice, disPercentage, sellingPrice);
        });

        sellingPrice.addEventListener("input", () => {
          updateDiscountPercentage(regularPrice, sellingPrice, disPercentage);
        });

        disAmount.addEventListener("input", () => {
          updateDiscountPercentage(regularPrice, sellingPrice, disPercentage);
          updateSellingPrice(regularPrice, disPercentage, sellingPrice);
        });

        disPercentage.addEventListener("input", () => {
          updateDiscountAmount(regularPrice, disPercentage, disAmount);
          updateSellingPrice(regularPrice, disPercentage, sellingPrice);
        });

        // -----------------------------------------------------------------------------------
      } catch (err) {
        console.log("new product adding error:", err);
      }
    });
  }

  // Coupon form submission validation
  const couponForm = document.getElementById("Add-coupon-form");
  if (couponForm) {
    couponForm.addEventListener("submit", async (event) => {
      try {
        event.preventDefault();

        const minPurchaseAmount =
          document.getElementById("coupon-min-amount").value;
        const disPercentage = document.getElementById("coupon-dis").value;
        const expDate = document.getElementById("coupon-expDate").value;
        const minAmountError = document.getElementById("minAmountError");
        const discountError = document.getElementById("discountError");
        const expDateError = document.getElementById("expDateError");
        let isValid = true;

        // Validate minimum purchase amount
        if (!minPurchaseAmount.trim()) {
          minAmountError.textContent = "*Minimum purchase amount is required";
          isValid = false;
          event.preventDefault();
        } else if (
          // eslint-disable-next-line no-restricted-globals
          isNaN(minPurchaseAmount) ||
          parseFloat(minPurchaseAmount) < 0
        ) {
          isValid = false;
          event.preventDefault();
          minAmountError.textContent =
            "*Minimum purchase amount must be a non-negative number";
        } else {
          minAmountError.textContent = "";
        }

        // validate discount percentage
        if (!disPercentage.trim()) {
          isValid = false;
          event.preventDefault();
          discountError.textContent = "*Discount percentage is required";
        } else if (
          isNaN(disPercentage) ||
          parseFloat(disPercentage) < 0 ||
          parseFloat(disPercentage) > 100
        ) {
          isValid = false;
          event.preventDefault();
          discountError.textContent =
            "Discount percentage must be between 0 and 100";
        } else {
          discountError.textContent = "";
        }

        // validate expiry date
        const currentDate = new Date();
        const formattedDate = new Date(expDate);
        formattedDate.setHours(23, 59, 59, 999);
        if (expDate === "") {
          isValid = false;
          event.preventDefault();
          expDateError.textContent = "Expiration date is required";
        } else if (formattedDate <= currentDate) {
          isValid = false;
          event.preventDefault();
          expDateError.textContent = "Expiration date must be in the future";
        } else {
          expDateError.textContent = "";
        }

        if (!isValid) {
          return event.preventDefault();
        }
        // collect date
        const newCouponData = {
          minimumPurchaseAmount: parseFloat(minPurchaseAmount),
          discountPercentage: parseFloat(disPercentage),
          expirationDate: formattedDate,
        };

        // pass the date to backend
        await fetch("/coupon/create_coupon", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newCouponData),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.message) {
              showSuccessMsg(data.message);
              document.getElementById("Add-coupon-form").reset();
              const { couponData } = data;

              // Get the table body element
              const tableBody = document.getElementById("coupon-table");

              // Create a new row
              const newRow = document.createElement("tr");
              newRow.innerHTML = `
              <td>${couponData.couponCode}</td>
              <td><i class="bx bx-rupee bx-xs"></i>${couponData.minimumPurchaseAmount}</td>
              <td>${couponData.discountPercentage}% off</td>
              <td>${couponData.createdAt}</td>
              <td>${couponData.expirationDate}</td>
              <td class="action-cell">
                <ul class="list-unstyled d-flex justify-content-around">
                  <li>
                    <a href="/coupon/deleteCoupon/${couponData._id}">
                      <i class="fa-solid fa-trash-can fa-lg" style="color: #c80000;"
                        title="Delete" data-user-id="${couponData._id}"
                        onclick="displayConformation(this, event, 'Are you sure, Do you want to delete this coupon?','/coupon/deleteCoupon/${couponData._id}')"></i>
                    </a>
                  </li>
                </ul>
              </td>
            `;

              // Insert the new row at the beginning of the table body
              tableBody.insertBefore(newRow, tableBody.firstChild);
              document.getElementById("empty-data-msg").classList.add("d-none");
            } else if (data.error) {
              throw new Error(data.error);
            }
          });
      } catch (err) {
        console.error("create coupon form submission error:", err);
      }
    });
  }

  // sales report custom date selection validation
  const customDateForm = document.getElementById("custom-date-form");
  if (customDateForm) {
    customDateForm.addEventListener("submit", (e) => {
      const startDate = new Date(document.getElementById("start-date").value);
      const endDate = new Date(document.getElementById("end-date").value);
      const customDateError = document.getElementById("customDate-error");
      if (startDate > endDate) {
        e.preventDefault();
        console.log("start date is big");
        customDateError.classList.remove("d-none");
      } else {
        console.log("end date is big");
        customDateError.classList.add("d-none");
      }
    });
  }

  // -----------------------------------------------------------------------------------

  // dashboard chart / graph

  const salesChart = document.getElementById("salesChart").getContext("2d");
  let salesGraph;

  // fetch dashboard chart data
  async function fetchData(filter) {
    return fetch(`/get_chartData?filter=${filter}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        // Create a new variable to hold the updated chart data
        let updatedChartData;

        // Update the chart based on the filter
        if (filter === "tw") {
          updatedChartData = {
            labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            datasets: [
              {
                label: "Total Sales Amount",
                data: data.salesData,
                backgroundColor: "rgba(54, 162, 235, 1)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1,
              },
            ],
          };
        } else if (filter === "w") {
          updatedChartData = {
            labels: Object.keys(data.salesData).map((week) => `Week ${week}`),
            datasets: [
              {
                label: "Total Sales Amount",
                data: Object.values(data.salesData),
                backgroundColor: "rgba(54, 162, 235, 1)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1,
              },
            ],
          };
        } else if (filter === "m") {
          updatedChartData = {
            labels: [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ],
            datasets: [
              {
                label: "Total Sales Amount",
                data: data.salesData,
                backgroundColor: "rgba(54, 162, 235, 1)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1,
              },
            ],
          };
        } else if (filter === "y") {
          updatedChartData = {
            labels: Object.keys(data.salesData),
            datasets: [
              {
                label: "Total Sales Amount",
                data: Object.values(data.salesData),
                backgroundColor: "rgba(54, 162, 235, 1)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1,
              },
            ],
          };
        }

        return updatedChartData;
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        return null;
      });
  }

  const filterSelect = document.getElementById("chart-filter");

  filterSelect.addEventListener("change", async () => {
    try {
      const selectedFilter = filterSelect.value;
      // fetch sales data based on filter
      const updatedData = await fetchData(selectedFilter);
      if (updatedData) {
        // Update the chart data
        salesGraph.data.labels = updatedData.labels;
        salesGraph.data.datasets = updatedData.datasets;
        salesGraph.update();
      }
    } catch (error) {
      console.error("Error updating chart:", error);
    }
  });

  // Initialize an empty chart
  salesGraph = new Chart(salesChart, {
    type: "bar",
    data: {
      labels: [],
      datasets: [
        {
          label: "Total Sales Amount",
          data: [],
          background: "rgba(54, 162, 235, 1)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      aspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  // Fetch initial data
  (async () => {
    try {
      const initialData = await fetchData("tw");
      if (initialData) {
        // Update the chart with initial data
        salesGraph.data.labels = initialData.labels;
        salesGraph.data.datasets = initialData.datasets;
        salesGraph.update();
      }
    } catch (error) {
      console.error("Error initializing chart:", error);
    }
  })();

  // -----------------------------------------------------------------------------------
  // Top selling product and category chart
  async function updateTopSellingChart() {
    try {
      // Fetch top selling data
      const topSellingData = await fetchTopSellingData();
      console.log("topSelling data", topSellingData);
      console.log("top selling products", topSellingData.topSellingProducts);

      const topProducts = topSellingData.topSellingProducts;
      const topCategories = topSellingData.topSellingCategories;
      topProducts.forEach((product) => console.log(product));
      // Create the chart
      const rankingChart = document
        .getElementById("rankingChart")
        .getContext("2d");
      const topSellingChart = new Chart(rankingChart, {
        type: "bar",
        data: {
          labels: [
            ...topProducts.map((product) => {
              if (product.name) {
                return product.name.length > 10
                  ? `${product.name.slice(0, 10)}...`
                  : product.name;
              }
              return "";
            }),
            ...topCategories.map((category) => {
              if (category.name) {
                return category.name.length > 10
                  ? `${category.name.slice(0, 10)}...`
                  : category.name;
              }
              return "";
            }),
          ],
          datasets: [
            {
              label: "Products",
              data: [
                ...topProducts.map((product) => product.totalQuantity),
                ...Array(topCategories.length).fill(0),
              ],
              backgroundColor: "rgba(153, 102, 255, 1)",
              borderColor: "rgba(153, 102, 255, 1)",
              borderWidth: 1,
            },
            {
              label: "Categories",
              data: [
                ...Array(topProducts.length).fill(0),
                ...topCategories.map((category) => category.totalQuantity),
              ],
              backgroundColor: "rgba(255, 99, 132, 1)",
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          aspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
          plugins: {
            tooltip: {
              callbacks: {
                title(tooltipItem) {
                  return tooltipItem[0].label;
                },
                label(tooltipItem) {
                  const index = tooltipItem.dataIndex;
                  if (index < topProducts.length) {
                    return `Product: ${topProducts[index].name} - Quantity: ${tooltipItem.formattedValue}`;
                  }
                  return `Category: ${topCategories[index - topProducts.length].name} - Quantity: ${tooltipItem.formattedValue}`;
                },
              },
            },
          },
        },
      });
    } catch (error) {
      console.error("Error updating top selling chart:", error);
    }
  }
  if (rankingChart) {
    updateTopSellingChart();
  }
  // Fetch data for top 10 selling products and categories
  async function fetchTopSellingData() {
    return fetch("/get_top_selling_data")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => data)
      .catch((error) => {
        console.error("Error fetching data:", error);
        return [];
      });
  }
  // DOM end
});

// -----------------------------------------------------------------------------------

// admin panel side navbar toggling
function sideNavToggle() {
  const navBar = document.querySelector("nav");
  const overlay = document.querySelector(".over-layer");
  const mainMenuBtn = document.querySelector(".main-menu-icon");
  const sideMenuBtn = document.querySelector(".side-menu-icon");
  mainMenuBtn.addEventListener("click", () => {
    navBar.classList.add("open");
  });
  sideMenuBtn.addEventListener("click", () => {
    navBar.classList.remove("open");
  });
  overlay.addEventListener("click", () => {
    navBar.classList.remove("open");
  });
}
// ----------------------------------------------------------------------------------

// discount calculation based on discount amount when adding new product
function updateDiscountPercentage(
  regularPriceInput,
  sellingPriceInput,
  discountPercentage
) {
  console.log("discount updating function called");
  const regularPriceValue = parseFloat(regularPriceInput.value) || 0;
  const sellingPriceValue = parseFloat(sellingPriceInput.value) || 0;
  const discountAmountValue = parseFloat(discountPercentage.value) || 0;

  let discountPercentageInput = 0;

  if (regularPriceValue !== 0) {
    discountPercentageInput =
      ((regularPriceValue - sellingPriceValue) / regularPriceValue) * 100;
  } else if (sellingPriceValue !== 0) {
    discountPercentageInput = (discountAmountValue / sellingPriceValue) * 100;
  }

  // eslint-disable-next-line no-param-reassign
  discountPercentage.value = Number.isNaN(discountPercentageInput)
    ? ""
    : discountPercentageInput.toFixed(2);
}

// Function to update selling price based on discount percentage
function updateSellingPrice(
  regularPriceInput,
  discountPercentageInput,
  sellingPriceInput
) {
  const regularPrice = parseFloat(regularPriceInput.value);
  const discountPercentage = parseFloat(discountPercentageInput.value);
  console.log("updateSellingPrice called");
  const discountAmount = (regularPrice * discountPercentage) / 100;
  const sellingPrice = regularPrice - discountAmount;
  // eslint-disable-next-line no-param-reassign
  sellingPriceInput.value = Number.isNaN(sellingPrice)
    ? ""
    : sellingPrice.toFixed(2);
}

// Function to update discount amount based on discount percentage
function updateDiscountAmount(
  regularPriceInput,
  discountPercentageInput,
  discountAmountInput
) {
  const regularPrice = parseFloat(regularPriceInput.value);
  const discountPercentage = parseFloat(discountPercentageInput.value);

  const discountAmount = (regularPrice * discountPercentage) / 100;
  // eslint-disable-next-line no-param-reassign
  discountAmountInput.value = Number.isNaN(discountAmount)
    ? ""
    : discountAmount.toFixed(2);
}

// ----------------------------------------------------------------------------------

// // Check if there is a success message in the URL and display message
// const urlParams = new URLSearchParams(window.location.search);
// const successMessage = urlParams.get("success");

// // Display the success message if it exists
// if (successMessage) {
//   shadowSuccessMessage(successMessage);
//   // Remove the "success" query string from the URL
//   urlParams.delete("success");
//   const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
//   window.history.replaceState({}, document.title, newUrl);
// }
// // success message display function
// function shadowSuccessMessage(msg) {
//   const msgBox = document.getElementById("successMessage");
//   msgBox.classList.remove("d-none");
//   msgBox.innerHTML = msg;
//   setTimeout(() => {
//     msgBox.classList.add("d-none");
//     msgBox.innerHTML = "";
//     sessionStorage.setItem("successMessageDisplayed", "true");
//   }, 3000);
// }
// // Check if the success message has been displayed before
// window.onload = function () {
//   const successMessageDisplayed = sessionStorage.getItem(
//     "successMessageDisplayed",
//   );
//   console.log("successMessageDisplayed", successMessageDisplayed);
//   if (successMessageDisplayed === "true") {
//     // If the message has been displayed, hide it immediately
//     const msgBox = document.getElementById("successMessage");
//     msgBox.classList.add("d-none");
//   }
// };
// Check if there is a success message in the URL and display message
const urlParams = new URLSearchParams(window.location.search);
const successMessage = urlParams.get("success");

// Display the success message if it exists
if (successMessage) {
  showSuccessMsg(successMessage);
  // Remove the "success" query string from the URL
  urlParams.delete("success");
  const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
  window.history.replaceState({}, document.title, newUrl);
}

// --------------------------------------------------------------------------------------
