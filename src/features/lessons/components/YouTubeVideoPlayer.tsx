import YouTube from "react-youtube";

export function YouTubeVideoPlayer({
	videoId,
	onFinishedVideo,
}: {
	videoId: string;
	onFinishedVideo?: () => void;
}) {
	return (
		<YouTube
			videoId={videoId}
			className="w-full h-full"
			opts={{ width: "100%", height: "100%" }}
			onEnd={onFinishedVideo}
		/>
	);
}

export function VideoPlayer({
	videoUrl,
	youtubeVideoId,
	onFinishedVideo,
}: {
	videoUrl?: string | null;
	youtubeVideoId?: string | null;
	onFinishedVideo?: () => void;
}) {
	if (videoUrl) {
		return (
			<video
				src={videoUrl}
				controls
				className="h-full w-full"
				onEnded={onFinishedVideo}
			>
				<track kind="captions" src="" label="English" />
			</video>
		);
	}

	if (youtubeVideoId) {
		return (
			<YouTubeVideoPlayer
				videoId={youtubeVideoId}
				onFinishedVideo={onFinishedVideo}
			/>
		);
	}

	return (
		<div className="flex h-full w-full items-center justify-center bg-black text-white">
			No video available
		</div>
	);
}
