document.getElementById('sequenceInput').addEventListener('input', function(e) {
    const text = e.target.value;
    let feedback = "Unknown format";
    
    // Basic FASTA detection
    if(text.startsWith(">")) {
        feedback = "Detected format: FASTA";

        // Further detection logic for DNA, RNA, or protein
        const sequenceLines = text.split("\n").slice(1).join("");
        // Strip gaps
        const sequence = sequenceLines.replace(/[-.]/g, "");
        if (/^[ATCGNatcgn]+$/.test(sequence)) {
            feedback += " - DNA detected";
        } else if (/^[AUCGNaucgn]+$/.test(sequence)) {
            feedback += " - RNA detected";
        } else if (/^[A-Za-z]+$/.test(sequence)) {
            feedback += " - Protein detected";
        }
    }
    
    document.getElementById('feedback').textContent = feedback;
});

