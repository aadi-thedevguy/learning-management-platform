export function VideoPlayer({ videoUrl }: { videoUrl?: string | null }) {
	if (!videoUrl) {
		return (
			<div className="flex h-full min-h-48 items-center justify-center bg-muted text-muted-foreground">
				No video uploaded for this lesson yet.
			</div>
		);
	}

	return (
		<video className="h-full w-full" controls preload="metadata" src={videoUrl}>
			<track kind="captions" />
			Your browser does not support the video tag.
		</video>
	);
}
