
// This is the URL where we get NASA APOD data in JSON format (covers June 30, 2024 to Oct 1, 2025)
const apodDataUrl = 'https://cdn.jsdelivr.net/gh/GCA-Classroom/apod/data.json';

// Wait for DOM to be fully loaded before running code
document.addEventListener('DOMContentLoaded', function() {
  // Get references to DOM elements
  const getImageBtn = document.getElementById('getImageBtn');
  const gallery = document.getElementById('gallery');
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');

  // Helper function to format date as YYYY-MM-DD
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

    // Array of 'Did You Know?' facts
    const didYouKnowFacts = [
      'Did you know? The largest volcano in the solar system is Olympus Mons on Mars.',
      'Did you know? A day on Venus is longer than its year.',
      'Did you know? Neutron stars can spin at a rate of 600 times per second.',
      'Did you know? The footprints on the Moon will remain for millions of years.',
      'Did you know? Jupiter has at least 79 moons!',
      'Did you know? The Sun makes up 99.86% of the mass in our solar system.',
      'Did you know? Space is completely silent.',
      'Did you know? One million Earths could fit inside the Sun.',
      'Did you know? Saturn’s rings are made of ice and rock.',
      'Did you know? The Milky Way galaxy will collide with Andromeda in about 4.5 billion years.'
    ];

    // Function to show loading screen with a random fact
    function showLoadingFact() {
      // Pick a random fact
      const fact = didYouKnowFacts[Math.floor(Math.random() * didYouKnowFacts.length)];
      // Show loading message with fact, centered vertically and horizontally
      gallery.innerHTML = `
        <div class="loading-screen" style="display:flex;flex-direction:column;justify-content:center;align-items:center;min-height:70vh;max-width:100%;text-align:center;margin:auto;">
          <div style="font-size:2.5rem;margin-bottom:18px;">🚀</div>
          <div style="font-size:1.3rem;color:#e62c2e;font-weight:bold;margin-bottom:18px;max-width:500px;">${fact}</div>
          <div id="loadingMsg" style="font-size:1.1rem;color:#13294b;">Loading images...</div>
        </div>
      `;
    }
  // Set default date range to past 7 days
  function setDefaultDates() {
  // For debugging, set start date to June 30, 2024 and end date to July 8, 2024
  startDateInput.value = '2024-06-30';
  endDateInput.value = '2024-07-08';
  }

  // Validate that start date is before or equal to end date
  function isValidDateRange(start, end) {
    return new Date(start) <= new Date(end);
  }

  // Get modal DOM elements
  const imageModal = document.getElementById('imageModal');
  const closeModal = document.getElementById('closeModal');
  const modalImg = document.getElementById('modalImg');
  const modalTitle = document.getElementById('modalTitle');
  const modalDate = document.getElementById('modalDate');
  const modalExplanation = document.getElementById('modalExplanation');

  // Function to open modal with image details
  function openModal(item) {
    // Clear previous modal content
    modalImg.style.display = 'none';
    modalImg.src = '';
    modalImg.alt = '';
    // Remove any previous video iframe or link
        const modalContent = modalTitle.parentElement;
        // Remove all elements with id="modalVideo" in modalContent
        Array.from(modalContent.querySelectorAll('#modalVideo')).forEach(el => el.remove());

    modalTitle.textContent = item.title;
    modalDate.textContent = item.date;
    modalExplanation.textContent = item.explanation;

    if (item.media_type === 'image') {
      // Show image in modal
      modalImg.style.display = 'block';
      modalImg.src = item.url;
      modalImg.alt = item.explanation;
    } else if (item.media_type === 'video') {
      // Show video in modal
      let videoEmbed = '';
      if (item.url.includes('youtube.com/embed')) {
        videoEmbed = `<iframe id="modalVideo" src="${item.url}" width="100%" height="350" frameborder="0" allowfullscreen style="border-radius:8px;margin-bottom:18px;"></iframe>`;
      } else {
        videoEmbed = `<a id="modalVideo" href="${item.url}" target="_blank" style="display:inline-block;margin-bottom:18px;font-size:1.1rem;color:#e62c2e;font-weight:bold;">Watch Video</a>`;
      }
      modalTitle.insertAdjacentHTML('beforebegin', videoEmbed);
    }
    imageModal.style.display = 'flex';
        // Scroll modal to top for visibility
        imageModal.scrollTop = 0;
  }

  // Function to close modal
  function hideModal() {
    imageModal.style.display = 'none';
    modalImg.src = '';
    modalTitle.textContent = '';
    modalDate.textContent = '';
    modalExplanation.textContent = '';
  }

  // Close modal when clicking the close button
  closeModal.addEventListener('click', hideModal);

  // Close modal when clicking outside modal content
  imageModal.addEventListener('click', function(event) {
    if (event.target === imageModal) {
      hideModal();
    }
  });

  // Fetch APOD images for the selected date range
  async function fetchApodImages() {
    // Get dates from inputs
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    // Validate dates
    if (!startDate || !endDate) {
      gallery.innerHTML = '<p>Please select both start and end dates.</p>';
      return;
    }
    if (!isValidDateRange(startDate, endDate)) {
      gallery.innerHTML = '<p>End date must be after start date.</p>';
      return;
    }


      // Show loading screen with random fact
      showLoadingFact();

      // Wait for 2.5 seconds before fetching images
      await new Promise(resolve => setTimeout(resolve, 2500));

    try {
      // Build API URL with parameters
      // NOTE: The correct API is apodDataUrl, not apodApi/apiKey
      // The data is already fetched from apodDataUrl (no API key needed)
      const response = await fetch(apodDataUrl);
      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();

      // Filter by date range, allow both images and videos
      const start = new Date(startDate);
      const end = new Date(endDate);
      const items = Array.isArray(data)
        ? data.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= start && itemDate <= end;
          })
        : [];

      // If no items found, show a message
      if (items.length === 0) {
        gallery.innerHTML = '<p>No images or videos found for this date range.</p>';
        return;
      }

      // Build HTML for the gallery
      let html = '';
      items.forEach((item, idx) => {
  // Debug: log each item being rendered
  console.log('Rendering:', item.date, item.media_type, item.title);
        if (item.media_type === 'image') {
          html += `
            <div class="apod-card" data-idx="${idx}" style="cursor:pointer;">
              <img src="${item.url}" alt="${item.explanation}" class="apod-img" />
              <h3>${item.title}</h3>
              <p>${item.date}</p>
            </div>
          `;
        } else if (item.media_type === 'video') {
          const thumb = item.thumbnail_url || 'https://via.placeholder.com/400x220?text=Video';
          html += `
            <div class="apod-card" data-idx="${idx}" style="cursor:pointer;">
              <div style="position:relative;">
                <img src="${thumb}" alt="${item.explanation}" class="apod-img" />
                <span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:#e62c2e;color:#fff;padding:10px 16px;border-radius:50%;font-size:2rem;box-shadow:0 2px 8px #0b1a2f;">▶</span>
              </div>
              <h3>${item.title}</h3>
              <p>${item.date}</p>
            </div>
          `;
        }
      });

      // Insert items into the gallery
      gallery.innerHTML = html;

      // Add click event listeners to each card to open modal
      const cards = gallery.querySelectorAll('.apod-card');
      cards.forEach((card, idx) => {
        card.addEventListener('click', () => {
          openModal(items[idx]);
        });
      });

    } catch (error) {
  // Remove loading message and show error message if something goes wrong
  gallery.innerHTML = `<p>Error fetching images: ${error.message}</p>`;
    }
  }

  // Set default dates on page load
  setDefaultDates();

  // Add event listener to the button
  getImageBtn.addEventListener('click', fetchApodImages);
});