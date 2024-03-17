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

function parseFASTA(text) {
    if (!text.startsWith(">")) return null;
    
    const sequences = {};
    let currentId = "";
    text.split("\n").forEach(line => {
        if (line.startsWith(">")) {
            currentId = line.substring(1).trim();
            sequences[currentId] = "";
        } else if (currentId) {
            sequences[currentId] += line.trim();
        }
    });
    return { format: "FASTA", sequences };
}

function parseCLUSTALSequence(text) {
    if (!text.startsWith("CLUSTAL") && !text.includes("CLUSTALW")) return null;

    const sequences = {};
    let sequenceLines = text.split("\n");
    sequenceLines.forEach(line => {
        if (line.trim() === "" || line.startsWith("CLUSTAL")) return;
        
        const parts = line.split(/ +/);
        if (parts.length < 2) return;

        const identifier = parts[0];
        const sequencePart = parts.slice(1).join("");

        if (sequences[identifier]) {
            sequences[identifier] += sequencePart;
        } else {
            sequences[identifier] = sequencePart;
        }
    });
    return { format: "CLUSTAL", sequences };
}

function detectFormatAndExtractSequence(text) {
    // Modular approach to format detection
    const formatDetectors = [parseFASTA, parseCLUSTALSequence];
    for (let detect of formatDetectors) {
        const result = detect(text);
        if (result !== null) return result;
    }
    return { format: "Unknown", sequences: {"": text} }; // Treat as raw sequence if no format detected
}

function detectSequenceTypes(sequences) {
    const sequenceTypes = {};
    Object.keys(sequences).forEach(identifier => {
        const sequence = sequences[identifier];
        const type = detectSequenceType(sequence);
        sequenceTypes[identifier] = type;
    });
    return sequenceTypes;
}

function handleInputEvent(e) {
    const text = e.target.value;

    // Detect format and extract sequences
    const { format, sequences } = detectFormatAndExtractSequence(text);

    // Determine the sequence types for each sequence
    const sequenceTypes = detectSequenceTypes(sequences);

    // Detail feedback
    // let feedback = `Format: ${format}\n`;
    // Object.keys(sequenceTypes).forEach(identifier => {
    //     feedback += `${identifier ? identifier + ": " : ""}${sequenceTypes[identifier]}\n`;
    // });
    // Extract unique sequence types from the detected types

    // Summary feedback
    const uniqueSequenceTypes = Object.values(sequenceTypes).reduce((acc, type) => {
        acc.add(type); // Add type to the Set, automatically ensuring uniqueness
        return acc;
    }, new Set());

    // Convert the Set of unique types to a string for display
    const uniqueSequenceTypesStr = Array.from(uniqueSequenceTypes).join(", ");

    // Count of sequences detected
    const numberOfSequences = Object.keys(sequences).length;

    // Generate feedback that includes the format, unique sequence types, and number of sequences
    let feedback = `Format: ${format}, Types: ${uniqueSequenceTypesStr}, Number of Sequences: ${numberOfSequences}`;

    document.getElementById('feedback').textContent = feedback.trim();
}

document.getElementById('sequenceInput').addEventListener('input', handleInputEvent);
