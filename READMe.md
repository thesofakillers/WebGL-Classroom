# Classroom Model
Originally made for Durham University's Department of Computer Science's course _Software Methodologies_ under the sub-module _Computer Graphics_, as part of the coursework in 2017/2018.

This repository contains a very simple 3D model of a classroom made with [WebGL](https://www.khronos.org/webgl/), providing some very basic user interaction.

## Usage
Simply open [classroom.html](Classroom/classroom.html) using a web browser that supports WebGL.

I recommend the use of Firefox -- Chrome appears to be sluggish.

The available commands are:

	- arrow keys: look around

	- w: move in direction you are facing
	- s: move away from what you are facing
	- a: strafe left
	- d: strafe right
	- q: strafe upwards
	- e: strafe downwards

	- m: move chairs backwards
	- n: move chairs forwards

	- k: close blinds
	- l: open blinds

	- o: open door
	- p: close door

	- c: erase board
	- v: write on board

	- 1: toggle front left light
	- 2: toggle front right right
	- 3: toggle back left light
	- 4: toggle back right light

I recommend to not have all the lights on when the blinds are open othewise your students will go blind!

Enjoy.

## In the Future
I am very much aware that this could use some massive improvements. Notably, I would like to re-implement the camera. Furthermore, the usage of boxes for creating the various models is quite outdated. In future implementations, I would much rather create models in software such as Blender and then export the mesh data to WebGL.
