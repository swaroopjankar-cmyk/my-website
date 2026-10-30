const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const nav = $("#nav");
const menuToggle = $("#menuToggle");

$("#year").textContent = new Date().getFullYear();

menuToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.textContent = open ? "×" : "☰";
});

$$(".nav a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
  });
});

let toastTimer;
let currentMemberName = "Member";

function toast(message) {
  const toastBox = $("#toast");
  toastBox.textContent = message;
  toastBox.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastBox.classList.remove("show"), 3200);
}

function openModal(id) {
  const modal = $("#" + id);
  modal.hidden = false;
  document.body.classList.add("modal-open");

  const firstInput = $("#" + id + " input");
  if (firstInput) {
    setTimeout(() => firstInput.focus(), 50);
  }
}

function closeModal(id) {
  const modal = $("#" + id);
  modal.hidden = true;

  if ($$(".modal:not([hidden])").length === 0) {
    document.body.classList.remove("modal-open");
  }
}

$("#openRegister").addEventListener("click", () => openModal("registerModal"));
$("#openLogin").addEventListener("click", () => openModal("loginModal"));

$("#googleLogin").addEventListener("click", () => {
  $("#googleLoginMessage").textContent =
    "Google sign-in isn't configured for this demo yet.";
});

$$("[data-close]").forEach((element) => {
  element.addEventListener("click", () => closeModal(element.dataset.close));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    $$(".modal:not([hidden])").forEach((modal) => closeModal(modal.id));
  }
});

$$(".choose-plan").forEach((button) => {
  button.addEventListener("click", () => {
    $("#registerPlan").value = button.dataset.plan;
    openModal("registerModal");
  });
});

$("#registerForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const data = Object.fromEntries(new FormData(event.currentTarget).entries());
  const profile = {
    name: data.name.trim(),
    email: data.email.trim(),
    plan: data.plan,
    focus: data.focus,
  };

  try {
    localStorage.setItem("proFitDemoProfile", JSON.stringify(profile));
  } catch (error) {
    // Dashboard still works for this session if storage is disabled.
  }

  $("#registerMessage").textContent =
    "Demo registration complete. Your dashboard is ready on this device.";
  $("#dashName").textContent = profile.name.split(" ")[0];
  $("#dashPlan").textContent = profile.plan;
  $("#dashFocus").textContent = profile.focus;
  currentMemberName = profile.name;
  $("#dashboard").hidden = false;
  closeModal("registerModal");
  $("#dashboard").scrollIntoView({ behavior: "smooth", block: "start" });
  event.currentTarget.reset();
  toast("Demo registration complete — welcome to Pro-Fit!");
});

$("#loginForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const data = Object.fromEntries(new FormData(event.currentTarget).entries());
  let saved = {};

  try {
    const storedProfile = JSON.parse(
      localStorage.getItem("proFitDemoProfile") || "{}"
    );

    if (storedProfile && typeof storedProfile === "object") {
      saved = storedProfile;
    } else {
      console.warn("Saved demo profile has an unexpected format.");
    }
  } catch (error) {
    console.warn("Could not read the saved demo profile.", error);
  }

  const savedProfileMatches =
    typeof saved.email === "string" &&
    saved.email.toLowerCase() === data.email.trim().toLowerCase();
  const profile = {
    name: data.name.trim(),
    email: data.email.trim(),
    plan: savedProfileMatches && typeof saved.plan === "string"
      ? saved.plan
      : "Demo member",
    focus: savedProfileMatches && typeof saved.focus === "string"
      ? saved.focus
      : "Build good habits",
  };

  $("#dashName").textContent = profile.name.split(" ")[0];
  $("#dashPlan").textContent = profile.plan || "Demo member";
  $("#dashFocus").textContent = profile.focus || "Build good habits";
  currentMemberName = profile.name;
  $("#dashboard").hidden = false;
  closeModal("loginModal");
  $("#dashboard").scrollIntoView({ behavior: "smooth", block: "start" });
  toast("Demo dashboard opened.");
});

$("#logoutBtn").addEventListener("click", () => {
  $("#dashboard").hidden = true;
  $("#home").scrollIntoView({ behavior: "smooth" });
  toast("You have exited the demo dashboard.");
});

const bmiDietRecommendations = [
  {
    category: "Underweight",
    goal: "Gain weight safely while ensuring nutrient adequacy.",
    tips: [
      "Eat calorie-dense, nutrient-rich foods such as nut butters, " +
        "avocados, full-fat dairy, and fatty fish like salmon.",
      "Include healthy fats like olive oil, coconut oil, chia seeds, " +
        "and nuts.",
      "Incorporate protein to build muscle mass: lean meats, eggs, " +
        "tofu, legumes, and dairy.",
      "Consider frequent meals and snacks to increase overall calorie " +
        "intake.",
    ],
  },
  {
    category: "Normal weight",
    goal: "Maintain weight and support overall health.",
    tips: [
      "Focus on a balanced diet with fruits, vegetables, whole grains, " +
        "lean proteins, and healthy fats.",
      "Limit added sugars and highly processed foods.",
      "Maintain moderate portion sizes and regular physical activity.",
    ],
  },
  {
    category: "Overweight",
    goal: "Gradual weight loss while preserving muscle mass.",
    tips: [
      "Reduce calorie intake slightly below daily energy expenditure.",
      "Emphasize high-fiber foods like vegetables, fruits, and whole " +
        "grains to increase satiety.",
      "Choose lean proteins (chicken, fish, legumes) and healthy fats " +
        "in moderation.",
      "Limit refined carbs, sugary drinks, and high-fat processed foods.",
    ],
  },
  {
    category: "Obese",
    goal: "Sustainable weight loss and improved metabolic health.",
    tips: [
      "Follow a structured, calorie-controlled diet with nutrient-dense " +
        "foods.",
      "Prioritize fiber-rich vegetables, fruits, and whole grains to " +
        "stay full and reduce cravings.",
      "Include lean protein sources to preserve muscle mass.",
      "Avoid excessive sugar and processed foods.",
      "Consider meal planning and portion control, possibly with " +
        "professional guidance.",
    ],
  },
];

$("#bmiForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const heightCm = Number($("#height").value);
  const weightKg = Number($("#weight").value);

  if (
    !heightCm ||
    !weightKg ||
    heightCm < 50 ||
    heightCm > 250 ||
    weightKg < 10 ||
    weightKg > 500
  ) {
    $("#bmiResultCopy").innerHTML =
      "<span class='result-symbol'>!</span><div><strong>Please check " +
      "your entries.</strong><p>Enter a height from 50–250 cm and a " +
      "weight from 10–500 kg.</p></div>";
    $("#bmiChart").hidden = true;
    $("#bmiRecommendations").hidden = true;
    return;
  }

  const bmi = weightKg / Math.pow(heightCm / 100, 2);
  let categoryIndex;
  let rangeDescription;

  if (bmi < 18.5) {
    categoryIndex = 0;
    rangeDescription = "below the standard adult range";
  } else if (bmi < 25) {
    categoryIndex = 1;
    rangeDescription = "within the standard adult range";
  } else if (bmi < 30) {
    categoryIndex = 2;
    rangeDescription = "above the standard adult range";
  } else {
    categoryIndex = 3;
    rangeDescription = "above the standard adult range";
  }

  const recommendation = bmiDietRecommendations[categoryIndex];
  const markerPosition = Math.min(Math.max((bmi / 40) * 100, 2), 98);
  const recommendationList = $("#bmiRecommendationList");

  $("#bmiResultCopy").innerHTML =
    `<span class="result-symbol">↗</span><div><strong>` +
    `BMI: ${bmi.toFixed(1)} · ${recommendation.category}</strong><p>` +
    `For adults, standard BMI categories are only a rough screening ` +
    `tool. They are not suitable for everyone and do not diagnose ` +
    `health.</p></div>`;
  $("#bmiMarker").style.setProperty("--bmi-position", `${markerPosition}%`);
  $("#bmiMarkerValue").textContent = bmi.toFixed(1);
  $("#bmiChart").setAttribute(
    "aria-label",
    `BMI ${bmi.toFixed(1)} is ${rangeDescription}. Yellow shows below ` +
      `18.5, green shows 18.5 to under 25, and red shows 25 or ` +
      `higher. The chart scale runs from 0 to 40 or higher.`
  );
  $("#bmiChart").hidden = false;
  $("#bmiRecommendationTitle").textContent =
    `Diet recommendations · ${recommendation.category}`;
  $("#bmiRecommendationGoal").textContent = `Goal: ${recommendation.goal}`;

  recommendationList.replaceChildren(
    ...recommendation.tips.map((tip) => {
      const item = document.createElement("li");
      item.textContent = tip;
      return item;
    })
  );

  $("#bmiRecommendations").hidden = false;
});

const reviews = [
  {
    quote:
      "The coaches made starting feel simple. I finally have a routine " +
        "I enjoy and can stick to.",
    name: "Maya S.",
    meta: "Member · 6 months",
    avatar: "M",
    rating: 5,
  },
  {
    quote:
      "I appreciate how welcoming the space feels. The guidance helped " +
        "me learn at my own pace.",
    name: "Rohan P.",
    meta: "Member · 4 months",
    avatar: "R",
    rating: 5,
  },
  {
    quote:
      "The variety keeps training interesting, and the coaches make " +
        "technique feel approachable.",
    name: "Anika D.",
    meta: "Member · 1 year",
    avatar: "A",
    rating: 5,
  },
];

let memberReviews = [];

try {
  const savedReviews = JSON.parse(
    localStorage.getItem("proFitMemberReviews") || "[]"
  );

  if (Array.isArray(savedReviews)) {
    const validReviews = savedReviews.filter(
      (review) =>
        review &&
        typeof review.name === "string" &&
        typeof review.quote === "string" &&
        Number.isInteger(Number(review.rating)) &&
        Number(review.rating) >= 1 &&
        Number(review.rating) <= 5
    );

    if (validReviews.length !== savedReviews.length) {
      console.warn("Some saved member reviews were invalid and were skipped.");
    }

    memberReviews = validReviews.map((review) => ({
      quote: review.quote,
      name: review.name,
      meta: "Member · community review",
      avatar: review.name.trim().charAt(0).toUpperCase() || "M",
      rating: Number(review.rating),
    }));
    reviews.push(...memberReviews);
  } else {
    console.warn("Saved member reviews were not in the expected format.");
  }
} catch (error) {
  console.warn("Could not load saved member reviews.", error);
}

let reviewIndex = 0;

function renderReview() {
  const review = reviews[reviewIndex];
  $("#reviewQuote").textContent = review.quote;
  $("#reviewName").textContent = review.name;
  $("#reviewMeta").textContent = review.meta;
  $("#reviewAvatar").textContent = review.avatar;
  $("#reviewStars").textContent = "★".repeat(review.rating);
  $("#reviewStars").setAttribute(
    "aria-label",
    `${review.rating} out of 5 stars`
  );
}

renderReview();

$("#prevReview").addEventListener("click", () => {
  reviewIndex = (reviewIndex - 1 + reviews.length) % reviews.length;
  renderReview();
});

$("#nextReview").addEventListener("click", () => {
  reviewIndex = (reviewIndex + 1) % reviews.length;
  renderReview();
});

$("#memberReviewForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());
  const quote = String(data.review).trim();
  const rating = Number(data.rating);

  if (!quote || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    $("#memberReviewMessage").textContent =
      "Please enter a review and choose a rating from 1 to 5 stars.";
    return;
  }

  const review = {
    quote,
    name: currentMemberName,
    meta: "Member · just now",
    avatar: currentMemberName.trim().charAt(0).toUpperCase() || "M",
    rating,
  };

  memberReviews.push({
    quote: review.quote,
    name: review.name,
    rating: review.rating,
  });
  reviews.push(review);
  reviewIndex = reviews.length - 1;
  renderReview();

  try {
    localStorage.setItem(
      "proFitMemberReviews",
      JSON.stringify(memberReviews)
    );
    $("#memberReviewMessage").textContent =
      "Thanks for sharing! Your review is now visible in the reviews section.";
  } catch (error) {
    $("#memberReviewMessage").textContent =
      "Your review is visible for this session, but could not be saved here.";
  }

  form.reset();
});

$("#contactForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const data = Object.fromEntries(new FormData(event.currentTarget).entries());
  const subject = encodeURIComponent(`Pro-Fit Gym enquiry: ${data.topic}`);
  const body = encodeURIComponent(
    `Name: ${data.name}\nEmail: ${data.email}\nTopic: ${data.topic}\n\n${data.message}`
  );

  $("#contactMessage").textContent =
    "Your email app should open with a draft. Update the gym email " +
    "address in Pro-Fit Gym.js first if needed.";

  // Replace hello@pro-fit.example with your real gym email address before publishing.
  window.location.href = `mailto:hello@pro-fit.example?subject=${subject}&body=${body}`;
});
