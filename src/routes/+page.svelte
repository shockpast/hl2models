<script lang="ts">
	import { Alert, Progressbar } from 'flowbite-svelte'
	import { sineOut } from 'svelte/easing'

	import { onMount } from 'svelte'
	import { createScene } from '$lib/scene'
  import { loadingProgress } from '$lib/store.js';

	export let data;
	let progress_value: number;

	loadingProgress.subscribe(value => {
		progress_value = value
	})

	let el: HTMLCanvasElement;
	onMount(() => createScene(el, data.models));
</script>

<style>
	.something {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 5px;
		width: 100%;
	}
</style>

<svelte:head>
	<title>Half-Life 2 - Model Viewer</title>
	<meta name="description" content="Half-Life 2 models with visualization (without animations) in 3D, and it's just web!" />
</svelte:head>


<div class="something">
	<p style="position: absolute; font-family: monospace; color: white; margin-top: 50px; text-align: center;">
		Loaded: {progress_value}% <span style="font-family: monospace; font-style: italic;">(.mdl, .vtf, .vmf, .vvd)</span><br>
		Use "W", "E", and "R" to change transform controls mode.
	</p>
</div>

<canvas bind:this={el} />