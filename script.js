// Detects the type of biological sequence (DNA, RNA, or Protein)
function detectSequenceType(sequence) {
    const cleanedSequence = sequence.replace(/[-.\s]/g, ""); // Strip gaps, newlines, and whitespace

    if (/^[ATCGNatcgn]+$/.test(cleanedSequence)) {
        return "DNA";
    } else if (/^[AUCGNaucgn]+$/.test(cleanedSequence)) {
        return "RNA";
    } else if (/^[A-Za-z]+$/.test(cleanedSequence)) {
        return "Protein";
    }

    return "Unknown";
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

    // Clear feedback if no input is provided
    if (text.trim() === "") {
        document.getElementById('feedback').textContent = "";
        return;
    }

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
    let feedback;

    if (numberOfSequences === 1) {
        const sequence = sequences[Object.keys(sequences)[0]];
        const sequenceLength = sequence.length;
        feedback = `Dectected ${format} | ${uniqueSequenceTypesStr} | single sequence | ${sequenceLength} residues`;
    } else {
        feedback = `Dectected ${format} | ${uniqueSequenceTypesStr} | ${numberOfSequences} sequences`;
    }

    document.getElementById('feedback').textContent = feedback.trim();
}

document.getElementById('sequenceInput').addEventListener('input', handleInputEvent);


// Input conversion functions
function convertToFASTA(sequences) {
    let fastaText = "";
    Object.keys(sequences).forEach(identifier => {
        fastaText += `>${identifier}\n${sequences[identifier]}\n`;
    });
    return fastaText;
}

function convertToCLUSTAL(sequences) {
    let clustalText = "CLUSTAL\n\n";
    const identifiers = Object.keys(sequences);
    const sequencesArray = Object.values(sequences);
    const maxLength = Math.max(...sequencesArray.map(sequence => sequence.length));

    for (let i = 0; i < maxLength; i += 60) {
        for (let j = 0; j < identifiers.length; j++) {
            const identifier = identifiers[j];
            const sequence = sequences[identifier];
            // Clustal ids cant have spaces
            // new_identifier = identifier.replace(/\s/g, "_");
            // Jalview just truncates the id after the first space
            new_identifier = identifier.split(" ")[0];
            // Add identifier and sequence chunk of 60 characters
            clustalText += `${new_identifier} ${sequence.substring(i, i + 60)}\n`;
        }
        clustalText += "\n";
    }
    return clustalText;
}

// Initialize Materialize select dropdown
document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('select');
    M.FormSelect.init(elems);
});

function triggerDownload(content, fileName) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', fileName);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

document.getElementById('convertAndDownload').addEventListener('click', function() {
    const text = document.getElementById('sequenceInput').value;
    const { sequences } = detectFormatAndExtractSequence(text);
    const outputFormat = document.getElementById('outputFormat').value;
    
    let convertedText = "";
    // Choose the conversion function based on the selected output format
    switch (outputFormat) {
        case "FASTA":
            convertedText = convertToFASTA(sequences);
            break;
        case "CLUSTAL":
            convertedText = convertToCLUSTAL(sequences);
            break;
        // Add more cases as needed for additional formats
        default:
            alert("Unsupported format selected");
            return;
    }

    // Trigger download
    triggerDownload(convertedText, `converted_sequence.${outputFormat.toLowerCase()}`);
});
