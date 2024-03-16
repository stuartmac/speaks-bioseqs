// Detects the type of biological sequence (DNA, RNA, or Protein)
function detectSequenceType(sequence) {
    const cleanedSequence = sequence.replace(/[-.]/g, "").split("\n").join(""); // Strip gaps and newlines

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
        // Extracts sequence lines, ignoring the first line (header)
        const sequenceLines = text.split("\n").slice(1).join("");
        return sequenceLines;
    }
    // Returns null if the input is not in FASTA format
    return null;
}

// Main function to handle input and provide feedback
function handleInputEvent(e) {
    const text = e.target.value;
    let feedback = "Unknown format";

    // Attempts to extract the sequence from FASTA format
    const sequenceFromFASTA = extractSequenceFromFASTA(text);

    // Determines the sequence type based on whether it was extracted from FASTA or is a simple string
    let sequenceType;
    if (sequenceFromFASTA !== null) {
        // If the sequence was extracted from FASTA, detect its type
        sequenceType = detectSequenceType(sequenceFromFASTA);
        feedback = `Detected format: FASTA - ${sequenceType}`;
    } else {
        // If the input is not in FASTA format, directly detect the sequence type
        sequenceType = detectSequenceType(text);
        feedback = sequenceType;
    }

    document.getElementById('feedback').textContent = feedback;
}

document.getElementById('sequenceInput').addEventListener('input', handleInputEvent);
