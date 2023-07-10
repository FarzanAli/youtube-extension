export async function getLangOptionsWithLink(videoId) {

	const videoPageResponse = await fetch("https://www.youtube.com/watch?v=" + videoId);
	const videoPageHtml = await videoPageResponse.text();
	const splittedHtml = videoPageHtml.split('"captions":')
	if (splittedHtml.length < 2) { return; }
	const captionTracks = JSON.parse(splittedHtml[1].split(',"videoDetails')[0].replace('\n', '')).playerCaptionsTracklistRenderer.captionTracks;
	const languages = Array.from(captionTracks).map(i => { return i.name.simpleText; })

	const priority = "English";
	languages.sort((x, y) => {return x.includes(priority) ? -1: y.includes(priority) ? 1: 0});
	languages.sort((x, y) => {return x == priority ? -1: y == priority ? 1: 0});

	return Array.from(languages).map((language, index) => {
		const link = captionTracks.find(i => i.name.simpleText == language).baseUrl
		return {
			language: language,
			link: link
		}
	})

}

export async function getRawTranscript(link) {
	// console.log(link)
    // Get Transcript
    const transcriptPageResponse = await fetch(link); // default 0
    const transcriptPageXml = await transcriptPageResponse.text();
    return transcriptPageXml;
}

export async function getTranscriptHTML(link, videoId) {

	const rawTranscript = await getRawTranscript(link);
	const transcript = document.createElement('parsed-transcript');
	transcript.innerHTML = rawTranscript;
	return Array.from(transcript.children[0].children).map((textDiv, index) => {
		// var elem = document.createElement('textarea');
		// elem.innerHTML = textDiv.innerHTML;
		// var decoded = elem.value;
		return {
			start: textDiv.getAttribute('start'),
			duration: textDiv.getAttribute('dur'),
			text: textDiv.textContent
		}
	})
  
  }