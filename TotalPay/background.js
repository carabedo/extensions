let selectedText
let totals 


chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "calculateTaskDetails",
      title: "Calculate Task Time and Payout",
      contexts: ["selection"]
    });
  });
  
  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "calculateTaskDetails") {
      selectedText = info.selectionText;
      console.log("Selected text:", selectedText);
      totals = calculateTotals(selectedText);
      console.log("Calculated totals:", totals);
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: displayTotals,
        args: [totals]
      });
    }
  });
  



  // Function to parse the text and calculate totals
function calculateTotals(text) {
    // Split text into rows based on '  ' (double spaces)
    const rows = text.split('  ');

    let totalMinutes = 0;
    let totalPayout = 0.0;

    rows.forEach(row => {
        // Extract the duration (assuming it follows 'Review ')
        const durationMatch = row.match(/(\d+h\s*)?(\d+m\s*)?(\d+s\s*)/);
        const duration = durationMatch ? durationMatch[0] : '';
        console.log('Processing duration:', duration);

        // Convert duration to minutes
        const durationInMinutes = parseDurationToMinutes(duration);
        console.log('Parsed duration into minutes:', durationInMinutes);

        if (!isNaN(durationInMinutes)) {
            totalMinutes += durationInMinutes;
        }

        // Extract all payouts
        const payoutMatches = row.match(/\$\d+\.\d{2}/g);
                
        if (payoutMatches && payoutMatches.length > 1) {
            // Use the second payout value
            const payout = parseFloat(payoutMatches[1].replace('$', ''));
            totalPayout += payout;
        }
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return {
        totalHours: hours,
        totalMinutes: minutes,
        totalPayout: totalPayout.toFixed(2)
    };
}

// Function to parse the duration string into minutes
function parseDurationToMinutes(duration) {
    let minutes = 0;

    // Regular expression to match hours, minutes, and seconds
    const timeParts = duration.match(/(\d+h)?(\d+m)?(\d+s)?/);

    if (timeParts) {
        if (timeParts[1]) {
            minutes += parseInt(timeParts[1].replace('h', '').trim()) * 60;
        }
        if (timeParts[2]) {
            minutes += parseInt(timeParts[2].replace('m', '').trim());
        }
        if (timeParts[3]) {
            minutes += parseInt(timeParts[3].replace('s', '').trim()) / 60;
        }
    }

    console.log(`Parsed duration "${duration}" into ${minutes} minutes.`);
    return minutes;
}



  
function displayTotals({ totalHours, totalMinutes, totalPayout }) {
    // Create or update the results div
    let resultDiv = document.getElementById('resultsDiv');
    
    if (!resultDiv) {
        resultDiv = document.createElement('div');
        resultDiv.id = 'resultsDiv';
        resultDiv.style.position = 'fixed';
        resultDiv.style.bottom = '10px';
        resultDiv.style.right = '10px';
        resultDiv.style.padding = '10px';
        resultDiv.style.backgroundColor = 'white';
        resultDiv.style.border = '1px solid black';
        resultDiv.style.boxShadow = '0px 0px 10px rgba(0,0,0,0.5)';
        resultDiv.style.zIndex = '1000'; // Ensure it appears on top of other content
        document.body.appendChild(resultDiv);
    }
    
    resultDiv.innerHTML = `<p>Total Time: ${totalHours} hours and ${totalMinutes} minutes</p>
                           <p>Total Payout: $${totalPayout}</p>`;
    
    // Set a timeout to remove the div after 10 seconds
    setTimeout(() => {
        resultDiv.remove();
    }, 10000); // 10000 milliseconds = 10 seconds
}