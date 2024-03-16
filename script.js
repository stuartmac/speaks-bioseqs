// Detects the type of biological sequence (DNA, RNA, or Protein)
function detectSequenceType(sequence) {
    const cleanedSequence = sequence.replace(/[-.\s]/g, ""); // Strip gaps, newlines, and whitespace

    if (/^[ATCGNatcgn]+$/.test(cleanedSequence)) {
        return "DNA detected";
    } else if (/^[AUCGNaucgn]+$/.test(cleanedSequence)) {
        return "RNA detected";
    } else if (/^[A-Za-z]+$/.test(cleanedSequence)) {
        return "Protein detected";
    }

    return "Unknown format";
}

// Checks if the input is in FASTA format and extracts the sequence
function extractSequenceFromFASTA(text) {
    if (text.startsWith(">")) {
        const sequenceLines = text.split("\n").slice(1).join("");
        return { format: "FASTA", sequence: sequenceLines };
    }
    return null;
}

// Checks if the input is in CLUSTAL format
function detectCLUSTALFormat(text) {
    // Simple CLUSTAL format check (can be expanded with more rigorous checks)
    if (text.startsWith("CLUSTAL") || text.includes("CLUSTALW")) {
        const sequenceLines = text.split("\n").slice(1).join(""); // Simplified extraction
        return { format: "CLUSTAL", sequence: sequenceLines };
    }
    return null;
}

// Tries to detect the format and extract the sequence
function detectFormatAndExtractSequence(text) {
    // Add more format detection functions here as needed
    const formatDetectors = [extractSequenceFromFASTA, detectCLUSTALFormat];
    for (let detect of formatDetectors) {
        const result = detect(text);
        if (result !== null) return result;
    }
    return { format: "Unknown", sequence: text }; // Default to treating the input as a raw sequence
}

// Main function to handle input and provide feedback
function handleInputEvent(e) {
    const text = e.target.value;

    // Detect format and extract sequence
    const { format, sequence } = detectFormatAndExtractSequence(text);

    // Determine the sequence type
    const sequenceType = detectSequenceType(sequence);
    const feedback = format === "Unknown" ? sequenceType : `Detected format: ${format} - ${sequenceType}`;

    document.getElementById('feedback').textContent = feedback;
}

document.getElementById('sequenceInput').addEventListener('input', handleInputEvent);
