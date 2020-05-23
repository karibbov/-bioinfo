function myFunction() {

	var input;
	input = document.getElementById("Genome").value;
	n = document.getElementById("length").value;
	pattern = document.getElementById("pattern").value;
	distance = document.getElementById("distance").value;
	func = document.getElementById("func").value;

	// output = inverseCompliment(input);
	// out = findPattern(pattern, input)
	// count = out.length
	// document.getElementById("output").innerHTML = 'Inverse Compliment: ' + out + ' count of pattern ' + count;
	output = functionHandler(input, pattern, n, distance, func);
	document.getElementById("output").innerHTML = 'Output: ' + output;
}

function functionHandler(sequence, pattern, n, distance, func) {
	if (func == "pattern") {
		return findPattern(pattern, sequence);
	}

	if (func == "inverse") {
		return inverseCompliment(pattern);
	}

	if (func == "frequent") {
		dict = findFrequentPattern(+n, sequence);
		a = 0;
		for (var key in dict) {
			a = ((key > a) ? key : a);
		}
		return dict[a];
	}

	if (func == "neighbour_test") {
		a = NeighbourGenerator(pattern, +distance);
		output = 'Count: ' + a.length + '\n' + a;
		console.log(a);
		return output;
	}

	if (func == "frequentWHamming") {
		dict = frequentKmerWtHamming(sequence, +distance, +n)
		a = 0;
		for (var key in dict) {
			a = ((key > a) ? key : a);
		}
		return dict[a];
	}
}

function inverseCompliment(pattern) {
	var i;
	var text = '';
	var a;
	for (i = pattern.length - 1; i >= 0; i--) {
		switch (pattern[i]) {
			case 'G':
			case 'g':
				a = 'C';
				break;
			case 'A':
			case 'a':
				a = 'T';
				break;
			case 'C':
			case 'c':
				a = 'G';
				break;
			case 'T':
			case 't':
				a = 'A';
				break;
			default:
				a = 'WrongChar';
				break;
		}

		text += a;
	}
	return text;
}

function findPattern(pattern, sequence) {
	var i = 0;
	var indices = [];
	while (i <= sequence.length - pattern.length) {
		index = sequence.indexOf(pattern, i)
		// indices.push(index)
		if (index != -1) {
			indices.push(index)
			i = index + 1;
		}
		if (index == -1) {
			i++;
		}
	}
	return indices
}


function findFrequentPattern(n, sequence) {
	var i = 0;
	var patterns = [];
	var counts = [];
	var pattern_dict = {};
	console.log(sequence.length - n);
	while (i <= sequence.length - n) {

		pattern = sequence.slice(i, i + n);

		// console.log(pattern, i, i+n);
		i++;
		// alert(pattern);
		indices = findPattern(pattern, sequence);
		inverseIndices = findPattern(inverseCompliment(pattern), sequence);
		count = indices.length + inverseIndices.length;

		if (!(count in pattern_dict)) {
			// console.log(pattern)
			pattern_dict[count] = [];
		}

		if (!(patterns.includes(pattern))) {
			pattern_dict[count].push(pattern);
			patterns.push(pattern);
		}

	}
	return pattern_dict;
}

function HammingDistance(sequenceA, sequenceB) {
	var distance = 0;
	for (var i = 0; i < sequenceA.length; i++) {
		if (sequenceA.charAt(i) != sequenceB.charAt(i)) {
			distance++;
		}
	}
	return distance;
}

function NeighbourGenerator(sequence, maxDistance) {
	var neighbourList = [];
	neighbourList.push(sequence);
	for (var j = 1; j <= maxDistance; j++) {
		// neighbourList = neighbourList.concat(generate_first_neighbours(sequence));
		// if (maxDistance > j )
		var list = [];
		for (var i = 0; i < neighbourList.length; i++) {
			list.push(...generate_first_neighbours(neighbourList[i]));
		}
		neighbourList = neighbourList.concat([...new Set(list)]);
		// d = neighbourList.forEach(generate_first_neighbours);
		// console.log(neighbourList);
	}
	return [...new Set(neighbourList)];
}

function generate_first_neighbours(sequence) {
	firstNeighbourList = [];
	firstNeighbourSet = new Set();
	vocabL = ['A', 'G', 'C', 'T'];

	for (var index = 0; index < sequence.length; index++) {
		let vocab = removeElement(vocabL, sequence[index]);
		for (var i = 0; i < vocab.length; i++) {
			neighbour = sequence.replaceAt(index, vocab[i]);
			// console.log(sequence, neighbour, vocab[i], index, i, vocabL);
			firstNeighbourSet.add(neighbour);
		}
		vocabL.push(sequence[index]);

	}
	// console.log(firstNeighbourSet);
	return [...firstNeighbourSet];
}

function removeElement(array, element) {
	var index = array.indexOf(element);
	array.splice(index, 1);
	return array
}

String.prototype.replaceAt = function (index, replacement) {
	return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}


function findPatternWithHamming(pattern, sequence, d) {
	var i = 0;
	var indices = [];
	var neighbour_list = [];
	console.log(pattern, sequence);
	while (i <= sequence.length - pattern.length) {
		candidate = sequence.substr(i, i+pattern.length);
		// neighbour_list = NeighbourGenerator(candidate, d);
		distance = HammingDistance(candidate, pattern);
		console.log(distance, i);
		if (distance <= d) {
			indices.push(candidate);
		}
		i++;
	}
	return indices
}

function generateCandidatesOnHamming(sequence, d, length){
	var neighbour_list = [];
	var i = 0;
	while (i <= sequence.length - length){
		console.log(i, sequence.length - length)
		neighbour_list.push(...NeighbourGenerator(sequence.substr(i, i+length), d));
		neighbour_list.push(...NeighbourGenerator(inverseCompliment(sequence.substr(i, i+length)), d));
		i++;
	}
	return [...new Set(neighbour_list)]
}

function frequentKmerWtHamming(sequence, d, K) {
	var i = 0;
	var patterns = [];
	var counts = [];
	var pattern_dict = {};
	// console.log(sequence.length - K);
	
	candidate_list = generateCandidatesOnHamming(sequence, d, K);
	console.log(candidate_list.length);
	for (var i = 0; i<=candidate_list.length; i++){
		if (typeof candidate_list[i] !== 'undefined') {
			pattern = candidate_list[i];
			indices = findPatternWithHamming(pattern, sequence, d);
			// inverseIndices = findPattern(inverseCompliment(pattern), sequence);
			count = indices.length;

			if (!(count in pattern_dict)) {
				// console.log(pattern)
				pattern_dict[count] = [];
			}
			// console.log(indices);
			if (!(patterns.includes(pattern))) {
				pattern_dict[count].push(pattern);
				patterns.push(pattern);
			}
		}
		
	}
	console.log(pattern_dict);
	return pattern_dict;
}
