//@ts-nocheck
//SourceModelLoader was created by https://github.com/gkjohnson, he's cool guy.

import {
	DefaultLoadingManager,
	FileLoader,
	Vector3,
	Quaternion,
	Euler,
	Matrix4
} from 'three';

// MDL: https://developer.valvesoftware.com/wiki/MDL
// https://github.com/ValveSoftware/source-sdk-2013/blob/master/sp/src/public/studio.h

const MDLLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

};

MDLLoader.prototype = {

	constructor: MDLLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( this.manager );
		loader.setPath( this.path );
		loader.setResponseType( 'arraybuffer' );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( text ) );

		}, onProgress, onError );

	},

	parse: function ( buffer ) {

		function readString( dataView, offset, count = Infinity ) {

			let str = '';
			for ( let j = 0; j < count; j ++ ) {

				const c = dataView.getUint8( j + offset );
				if ( c === 0 ) break;

				str += String.fromCharCode( c );

			}

			return str;

		}

		// studiohdr_t
		function parseHeader( buffer ) {

			const dataView = new DataView( buffer );
			let i = 0;

			// int id;
			const id = dataView.getInt32( i, true );
			i += 4;

			// int version;
			const version = dataView.getInt32( i, true );
			i += 4;

			// int checksum;
			const checksum = dataView.getInt32( i, true );
			i += 4;

			// char name[64];
			const name = readString( dataView, i, 64 );
			i += 64;

			// int length;
			const length = dataView.getInt32( i, true );
			i += 4;

			// Vector eyeposition;
			const eyeposition = new Vector3();
			eyeposition.x = dataView.getFloat32( i + 0, true );
			eyeposition.y = dataView.getFloat32( i + 4, true );
			eyeposition.z = dataView.getFloat32( i + 8, true );
			i += 12;

			// Vector illumposition;
			const illumposition = new Vector3();
			illumposition.x = dataView.getFloat32( i + 0, true );
			illumposition.y = dataView.getFloat32( i + 4, true );
			illumposition.z = dataView.getFloat32( i + 8, true );
			i += 12;

			// Vector hull_min;
			const hullMin = new Vector3();
			hullMin.x = dataView.getFloat32( i + 0, true );
			hullMin.y = dataView.getFloat32( i + 4, true );
			hullMin.z = dataView.getFloat32( i + 8, true );
			i += 12;

			// Vector hull_max;
			const hullMax = new Vector3();
			hullMax.x = dataView.getFloat32( i + 0, true );
			hullMax.y = dataView.getFloat32( i + 4, true );
			hullMax.z = dataView.getFloat32( i + 8, true );
			i += 12;

			// Vector view_bbmin;
			const viewBbmin = new Vector3();
			viewBbmin.x = dataView.getFloat32( i + 0, true );
			viewBbmin.y = dataView.getFloat32( i + 4, true );
			viewBbmin.z = dataView.getFloat32( i + 8, true );
			i += 12;

			// Vector view_bbmax;
			const viewBbmax = new Vector3();
			viewBbmax.x = dataView.getFloat32( i + 0, true );
			viewBbmax.y = dataView.getFloat32( i + 4, true );
			viewBbmax.z = dataView.getFloat32( i + 8, true );
			i += 12;

			// int flags;
			const flags = dataView.getInt32( i, true );
			i += 4;

			// int numbones;
			const numbones = dataView.getInt32( i, true );
			i += 4;

			// int boneindex;
			const boneindex = dataView.getInt32( i, true );
			i += 4;

			// int numbonecontrollers;
			const numbonecontrollers = dataView.getInt32( i, true );
			i += 4;

			// int bonecontrollerindex;
			const bonecontrollerindex = dataView.getInt32( i, true );
			i += 4;

			// int numhitboxsets;
			const numhitboxsets = dataView.getInt32( i, true );
			i += 4;

			// int hitboxsetindex;
			const hitboxsetindex = dataView.getInt32( i, true );
			i += 4;

			// int numlocalanim;
			const numlocalanim = dataView.getInt32( i, true );
			i += 4;

			// int localanimindex;
			const localanimindex = dataView.getInt32( i, true );
			i += 4;

			// int numlocalseq;
			const numlocalseq = dataView.getInt32( i, true );
			i += 4;

			// int localseqindex;
			const localseqindex = dataView.getInt32( i, true );
			i += 4;

			// mutable int activitylistversion;
			const activitylistversion = dataView.getInt32( i, true );
			i += 4;

			// mutable int eventsindexed;
			const eventsindexed = dataView.getInt32( i, true );
			i += 4;

			// int numtextures;
			const numtextures = dataView.getInt32( i, true );
			i += 4;

			// int textureindex;
			const textureindex = dataView.getInt32( i, true );
			i += 4;

			// int numcdtextures;
			const numcdtextures = dataView.getInt32( i, true );
			i += 4;

			// int cdtextureindex;
			const cdtextureindex = dataView.getInt32( i, true );
			i += 4;

			// int numskinref;
			const numskinref = dataView.getInt32( i, true );
			i += 4;

			// int numskinfamilies;
			const numskinfamilies = dataView.getInt32( i, true );
			i += 4;

			// int skinindex;
			const skinindex = dataView.getInt32( i, true );
			i += 4;

			// int numbodyparts;
			const numbodyparts = dataView.getInt32( i, true );
			i += 4;

			// int bodypartindex;
			const bodypartindex = dataView.getInt32( i, true );
			i += 4;

			// int numlocalattachments;
			const numlocalattachments = dataView.getInt32( i, true );
			i += 4;

			// int localattachmentindex;
			const localattachmentindex = dataView.getInt32( i, true );
			i += 4;

			// int numlocalnodes;
			const numlocalnodes = dataView.getInt32( i, true );
			i += 4;

			// int localnodeindex;
			const localnodeindex = dataView.getInt32( i, true );
			i += 4;

			// int localnodenameindex;
			const localnodenameindex = dataView.getInt32( i, true );
			i += 4;

			// int numflexdesc;
			const numflexdesc = dataView.getInt32( i, true );
			i += 4;

			// int flexdescindex;
			const flexdescindex = dataView.getInt32( i, true );
			i += 4;

			// int numflexcontrollers;
			const numflexcontrollers = dataView.getInt32( i, true );
			i += 4;

			// int flexcontrollerindex;
			const flexcontrollerindex = dataView.getInt32( i, true );
			i += 4;

			// int numflexrules;
			const numflexrules = dataView.getInt32( i, true );
			i += 4;

			// int flexruleindex;
			const flexruleindex = dataView.getInt32( i, true );
			i += 4;

			// int numikchains;
			const numikchains = dataView.getInt32( i, true );
			i += 4;

			// int ikchainindex;
			const ikchainindex = dataView.getInt32( i, true );
			i += 4;

			// int nummouths;
			const nummouths = dataView.getInt32( i, true );
			i += 4;

			// int mouthindex;
			const mouthindex = dataView.getInt32( i, true );
			i += 4;

			// int numlocalposeparameters;
			const numlocalposeparameters = dataView.getInt32( i, true );
			i += 4;

			// int localposeparamindex;
			const localposeparamindex = dataView.getInt32( i, true );
			i += 4;

			// int surfacepropindex;
			const surfacepropindex = dataView.getInt32( i, true );
			i += 4;

			// int keyvalueindex;
			const keyvalueindex = dataView.getInt32( i, true );
			i += 4;

			// int keyvaluesize;
			const keyvaluesize = dataView.getInt32( i, true );
			i += 4;

			// int numlocalikautoplaylocks;
			const numlocalikautoplaylocks = dataView.getInt32( i, true );
			i += 4;

			// int localikautoplaylockindex;
			const localikautoplaylockindex = dataView.getInt32( i, true );
			i += 4;

			// float mass;
			const mass = dataView.getFloat32( i, true );
			i += 4;

			// int contents;
			const contents = dataView.getInt32( i, true );
			i += 4;

			// int numincludemodels;
			const numincludemodels = dataView.getInt32( i, true );
			i += 4;

			// int includemodelindex;
			const includemodelindex = dataView.getInt32( i, true );
			i += 4;

			// mutable void *virtualModel;
			i += 4;

			// int szanimblocknameindex;
			const szanimblocknameindex = dataView.getInt32( i, true );
			i += 4;

			// int numanimblocks;
			const numanimblocks = dataView.getInt32( i, true );
			i += 4;

			// int animblockindex;
			const animblockindex = dataView.getInt32( i, true );
			i += 4;

			// TODO: load anim blocks

			// mutable void *animblockModel;
			i += 4;

			// int bonetablebynameindex;
			const bonetablebynameindex = dataView.getInt32( i, true );
			i += 4;

			// void *pVertexBase;
			i += 4;

			// void *pIndexBase;
			i += 4;

			// byte constdirectionallightdot;
			const constdirectionallightdot = dataView.getUint8( i, true );
			i += 1;

			// byte rootLOD;
			const rootLOD = dataView.getUint8( i, true );
			i += 1;

			// byte numAllowedRootLODs;
			const numAllowedRootLODs = dataView.getUint8( i, true );
			i += 1;

			// byte unused[1];
			i += 1;

			// int unused4;
			i += 4;

			// int numflexcontrollerui;
			const numflexcontrollerui = dataView.getInt32( i, true );
			i += 4;

			// int flexcontrolleruiindex;
			const flexcontrolleruiindex = dataView.getInt32( i, true );
			i += 4;

			// float flVertAnimFixedPointScale;
			const flVertAnimFixedPointScale = dataView.getFloat32( i, true );
			i += 4;

			// int unused3[1];
			i += 4;

			// int studiohdr2index;
			const studiohdr2index = dataView.getInt32( i, true );
			i += 4;

			// int unused2[1];
			i += 4;

			return {
				id,
				version,
				checksum,
				name,
				length,
				eyeposition,
				illumposition,
				hullMin,
				hullMax,
				viewBbmin,
				viewBbmax,
				flags,
				numbones,
				boneindex,
				numbonecontrollers,
				bonecontrollerindex,
				numhitboxsets,
				hitboxsetindex,
				numlocalanim,
				localanimindex,
				numlocalseq,
				localseqindex,
				activitylistversion,
				eventsindexed,
				numtextures,
				textureindex,
				numcdtextures,
				cdtextureindex,
				numskinref,
				numskinfamilies,
				skinindex,
				numbodyparts,
				bodypartindex,
				numlocalattachments,
				localattachmentindex,
				numlocalnodes,
				localnodeindex,
				localnodenameindex,
				numflexdesc,
				flexdescindex,
				numflexcontrollers,
				flexcontrollerindex,
				numflexrules,
				flexruleindex,
				numikchains,
				ikchainindex,
				nummouths,
				mouthindex,
				numlocalposeparameters,
				localposeparamindex,
				surfacepropindex,
				keyvalueindex,
				keyvaluesize,
				numlocalikautoplaylocks,
				localikautoplaylockindex,
				mass,
				contents,
				numincludemodels,
				includemodelindex,
				// virtualModel,
				szanimblocknameindex,
				numanimblocks,
				animblockindex,
				// animblockModel,
				bonetablebynameindex,
				// pVertexBase,
				// pIndexBase,
				constdirectionallightdot,
				rootLOD,
				numAllowedRootLODs,
				// unused,
				// unused4,
				numflexcontrollerui,
				flexcontrolleruiindex,
				flVertAnimFixedPointScale,
				// unused3,
				studiohdr2index,
				// unused2
			};

		}

		function parseSecondaryHeader( buffer, offset ) {

			if ( offset === 0 ) return null;

			const dataView = new DataView( buffer );
			let i = offset;

			// int
			const srcbonetransformCount = dataView.getInt32( i, true );
			i += 4;

			// int
			const srcbonetransformIndex = dataView.getInt32( i, true );
			i += 4;

			// int
			const illumpositionattachmentindex = dataView.getInt32( i, true );
			i += 4;

			// float
			const flMaxEyeDeflection = dataView.getFloat32( i, true );
			i += 4;

			// int
			const linearboneIndex = dataView.getInt32( i, true );
			i += 4;

			// int[64]
			const unknown = null;
			i += 64 * 4;

			return {
				srcbonetransformCount,
				srcbonetransformIndex,
				illumpositionattachmentindex,
				flMaxEyeDeflection,
				linearboneIndex,
				unknown
			};


		}

		function readData( header, header2, buffer ) {

			const dataView = new DataView( buffer );
			const textures = [];
			// struct mstudiotexture_t
			for ( let i = 0; i < header.numtextures; i ++ ) {

				const offset = header.textureindex + i * 16 * 4;
				const sznameindex = dataView.getInt32( offset, true );
				// var flags = dataView.getInt32( offset + 4, true );
				// var used = dataView.getInt32( offset + 8, true );

				// int unused1
				// void* material
				// void* clientmaterial
				// int unused[10]

				textures.push( readString( dataView, offset + sznameindex ) );

			}

			const textureDirectories = [];
			for ( let i = 0; i < header.numcdtextures; i ++ ) {

				const offset = header.cdtextureindex + i * 4;
				const ptr = dataView.getInt32( offset, true );
				textureDirectories.push( readString( dataView, ptr ) );

			}

			const includeModels = [];
			// struct mstudiomodelgroup_t
			for ( let i = 0; i < header.numincludemodels; i ++ ) {

				const offset = header.includemodelindex + i * 8;
				const model = {};
				model.label = readString( dataView, offset + dataView.getInt32( offset + 0, true ) );
				model.name = readString( dataView, offset + dataView.getInt32( offset + 4, true ) );
				includeModels.push( model );

			}

			// struct mstudiobodyparts_t
			const bodyParts = [];
			for ( let i = 0; i < header.numbodyparts; i ++ ) {

				const offset = header.bodypartindex + i * 16;
				const bodyPart = {};
				bodyPart.name = readString( dataView, offset + dataView.getInt32( offset + 0, true ) );
				bodyPart.nummodels = dataView.getInt32( offset + 4, true );
				bodyPart.base = dataView.getInt32( offset + 8, true );
				bodyPart.modelindex = dataView.getInt32( offset + 12, true );
				bodyPart.models = [];
				bodyParts.push( bodyPart );

				// struct mstudiomodel_t
				for ( let i2 = 0; i2 < bodyPart.nummodels; i2 ++ ) {

					const offset2 = offset + bodyPart.modelindex + i2 * 148;
					const model = {};
					model.name = readString( dataView, offset2 + 0, 64 );
					model.type = dataView.getInt32( offset2 + 64, true );
					model.boundingradius = dataView.getFloat32( offset2 + 64 + 4, true );

					model.nummeshes = dataView.getInt32( offset2 + 64 + 8, true );
					model.meshindex = dataView.getInt32( offset2 + 64 + 12, true );

					model.numvertices = dataView.getInt32( offset2 + 64 + 16, true );
					model.vertexindex = dataView.getInt32( offset2 + 64 + 20, true );
					model.tangentsindex = dataView.getInt32( offset2 + 64 + 24, true );

					model.numattachments = dataView.getInt32( offset2 + 64 + 28, true );
					model.attachmentindex = dataView.getInt32( offset2 + 64 + 32, true );
					model.numeyeballs = dataView.getInt32( offset2 + 64 + 36, true );
					model.eyeballindex = dataView.getInt32( offset2 + 64 + 40, true );

					// 108 bytes so far

					// mstudio_modelvertexdata_t -- contains two void pointers

					// int unused[8]

					// 108 + 8 + 8 * 4 = 148 bytes

					model.meshes = [];
					bodyPart.models.push( model );

					// TODO: Some times the amount of meshes here is (seemingly incorrectly) huge
					// and causes an out of memory crash

					// struct mstudiomesh_t
					for ( let i3 = 0; i3 < model.nummeshes; i3 ++ ) {

						const offset3 = offset2 + model.meshindex + i3 * 116;
						const mesh = {};
						mesh.material = dataView.getInt32( offset3 + 0, true );
						mesh.modelindex = dataView.getInt32( offset3 + 4, true );

						mesh.numvertices = dataView.getInt32( offset3 + 8, true );
						mesh.vertexoffset = dataView.getInt32( offset3 + 12, true );

						mesh.numflexes = dataView.getInt32( offset3 + 16, true );
						mesh.flexindex = dataView.getInt32( offset3 + 20, true );

						mesh.materialtype = dataView.getInt32( offset3 + 24, true );
						mesh.materialparam = dataView.getInt32( offset3 + 28, true );

						mesh.meshid = dataView.getInt32( offset3 + 32, true );
						mesh.center = new Vector3(
							dataView.getFloat32( offset3 + 36, true ),
							dataView.getFloat32( offset3 + 40, true ),
							dataView.getFloat32( offset3 + 44, true ),
						);

						// 48 bytes total

						// TODO: should we parse this?
						// mstudio_modelvertexdata_t vertexdata (36 bytes)
						//     mstudio_modelvertexdata_t    *modelvertexdata; -- 4
						//     int                           numLODVertexes[MAX_NUM_LODS]; -- 4 * 8

						// 84 bytes total

						// int unused[8]

						// 116 total

						model.meshes.push( mesh );

					}

				}

			}

			// mstudiobone_t
			const bones = [];
			for ( let i = 0; i < header.numbones; i ++ ) {

				const offset = header.boneindex + i * 216;
				const bone = {};

				bone.name = readString( dataView, offset + dataView.getInt32( offset + 0, true ) );
				bone.parent = dataView.getInt32( offset + 4, true );

				const bonecontroller = new Array( 6 );
				for ( let i = 0; i < 6; i ++ ) {

					bonecontroller[ i ] = dataView.getInt32( offset + 8 + i * 4, true );

				}

				bone.bonecontroller = bonecontroller;

				// 6 * 4 = 24
				// 8 + 24 = 32

				bone.pos = new Vector3();
				bone.pos.x = dataView.getFloat32( offset + 32, true );
				bone.pos.y = dataView.getFloat32( offset + 36, true );
				bone.pos.z = dataView.getFloat32( offset + 40, true );

				bone.quaternion = new Quaternion();
				bone.quaternion.x = dataView.getFloat32( offset + 44, true );
				bone.quaternion.y = dataView.getFloat32( offset + 48, true );
				bone.quaternion.z = dataView.getFloat32( offset + 52, true );
				bone.quaternion.w = dataView.getFloat32( offset + 56, true );

				bone.radianEuler = new Euler();
				bone.radianEuler.x = dataView.getFloat32( offset + 60, true );
				bone.radianEuler.y = dataView.getFloat32( offset + 64, true );
				bone.radianEuler.z = dataView.getFloat32( offset + 68, true );

				bone.posscale = new Vector3();
				bone.posscale.x = dataView.getFloat32( offset + 72, true );
				bone.posscale.y = dataView.getFloat32( offset + 76, true );
				bone.posscale.z = dataView.getFloat32( offset + 80, true );

				bone.rotscale = new Vector3();
				bone.rotscale.x = dataView.getFloat32( offset + 84, true );
				bone.rotscale.y = dataView.getFloat32( offset + 88, true );
				bone.rotscale.z = dataView.getFloat32( offset + 92, true );

				const posToBone = new Matrix4();
				posToBone.identity();
				for ( let i = 0; i < 12; i ++ ) {

					posToBone.elements[ i ] = dataView.getFloat32( offset + 96 + i * 4, true );

				}

				bone.posToBone = posToBone;
				// console.log( posToBone.elements )

				// postobone
				// 3 * 4 * 4 bytes = 48
				// 96 + 48 = 144

				bone.qAlignment = new Quaternion();
				bone.qAlignment.x = dataView.getFloat32( offset + 144, true );
				bone.qAlignment.y = dataView.getFloat32( offset + 148, true );
				bone.qAlignment.z = dataView.getFloat32( offset + 152, true );
				bone.qAlignment.w = dataView.getFloat32( offset + 156, true );

				bone.flags = dataView.getInt32( offset + 160, true );
				bone.proctype = dataView.getInt32( offset + 164, true );
				bone.procindex = dataView.getInt32( offset + 168, true );
				bone.physicsbone = dataView.getInt32( offset + 172, true );
				bone.surfacepropidx = dataView.getInt32( offset + 176, true );
				bone.contents = dataView.getInt32( offset + 180, true );

				// unused
				// 4 * 8 bytes = 32
				// 184 + 32 = 216

				bones.push( bone );

			}

			const boneControllers = [];
			for ( let i = 0; i < header.numbonecontrollers; i ++ ) {

				const boneController = {};
				const offset = header.bonecontrollerindex + i * 56;

				boneController.bone = dataView.getInt32( offset, true );
				boneController.type = dataView.getInt32( offset + 4, true ); // X Y Z XR YR ZR M
				boneController.start = dataView.getFloat32( offset + 8, true );
				boneController.end = dataView.getFloat32( offset + 12, true );
				boneController.rest = dataView.getInt32( offset + 16, true );
				boneController.inputfield = dataView.getInt32( offset + 20, true );

				// int unused[8]

				boneControllers.push( boneController );

			}

			const animDescriptions = [];
			// struct mstudioanimdesc_t
			for ( let i = 0; i < header.numlocalanim; i ++ ) {

				const animDesc = {};
				const offset = header.localanimindex + i * 100;

				animDesc.baseptr = dataView.getInt32( offset, true );
				animDesc.name = readString( dataView, offset + dataView.getInt32( offset + 4, true ) );
				animDesc.fps = dataView.getFloat32( offset + 8, true );
				animDesc.flags = dataView.getInt32( offset + 12, true );
				animDesc.numframes = dataView.getInt32( offset + 16, true );

				animDesc.nummovements = dataView.getInt32( offset + 20, true );
				animDesc.movementindex = dataView.getInt32( offset + 24, true );

				// struct mstudiomovement_t
				animDesc.movements = [];
				for ( let i2 = 0; i2 < animDesc.nummovements; i2 ++ ) {

					const movement = {};
					const offset2 = offset + animDesc.movementindex + i2 * 44;

					movement.endframe = dataView.getInt32( offset2, true );
					movement.motionflags = dataView.getInt32( offset2 + 4, true );
					movement.v0 = dataView.getFloat32( offset2 + 8, true );
					movement.v1 = dataView.getFloat32( offset2 + 12, true );
					movement.angle = dataView.getFloat32( offset2 + 16, true );

					movement.vector = {};
					movement.vector.x = dataView.getFloat32( offset2 + 20, true );
					movement.vector.y = dataView.getFloat32( offset2 + 24, true );
					movement.vector.z = dataView.getFloat32( offset2 + 28, true );

					movement.position = {};
					movement.position.x = dataView.getFloat32( offset2 + 32, true );
					movement.position.y = dataView.getFloat32( offset2 + 36, true );
					movement.position.z = dataView.getFloat32( offset2 + 40, true );

					animDesc.movements.push( movement );

				}

				// int unused[16]

				// 6 * 4 + 28 = 52 bytes

				animDesc.animblock = dataView.getInt32( offset + 52, true );
				animDesc.animindex = dataView.getInt32( offset + 56, true );

				// TODO: Load anim blocks

				animDesc.numikrules = dataView.getInt32( offset + 60, true );
				animDesc.ikruleindex = dataView.getInt32( offset + 64, true );
				animDesc.animblockikruleindex = dataView.getInt32( offset + 68, true );

				// TODO: Load IK Rules

				animDesc.numlocalhierarchy = dataView.getInt32( offset + 72, true );
				animDesc.numlocalhierarchyindex = dataView.getInt32( offset + 76, true );

				// TODO: Load local hierarchies

				animDesc.sectionindex = dataView.getInt32( offset + 80, true );
				animDesc.sectionframes = dataView.getInt32( offset + 84, true );

				// TODO: Load animation sections

				animDesc.zeroframespan = dataView.getInt16( offset + 88, true );
				animDesc.zeroframecount = dataView.getInt16( offset + 80, true );
				animDesc.zeroframeindex = dataView.getInt32( offset + 92, true );

				// TODO: Load zero frame data

				animDesc.zeroframestalltime = dataView.getFloat32( offset + 96, true );

				animDescriptions.push( animDesc );

			}

			// struct mstudioseqdesc_t
			const localSequences = [];
			for ( let i = 0; i < header.numlocalseq; i ++ ) {

				const localSeq = {};
				const offset = header.localseqindex + i * 212;

				localSeq.baseptr = dataView.getInt32( offset, true );
				localSeq.label = readString( dataView, offset + dataView.getInt32( offset + 4, true ) );
				localSeq.activityName = readString( dataView, offset + dataView.getInt32( offset + 8, true ) );

				localSeq.flags = dataView.getInt32( offset + 12, true );
				localSeq.activity = dataView.getInt32( offset + 16, true );
				localSeq.actweight = dataView.getInt32( offset + 20, true );

				localSeq.numevents = dataView.getInt32( offset + 24, true );
				localSeq.eventindex = dataView.getInt32( offset + 28, true );

				// TODO: Load mstudioevent_t

				localSeq.bbmin = {};
				localSeq.bbmin.x = dataView.getFloat32( offset + 32, true );
				localSeq.bbmin.y = dataView.getFloat32( offset + 36, true );
				localSeq.bbmin.z = dataView.getFloat32( offset + 40, true );

				localSeq.bbmax = {};
				localSeq.bbmax.x = dataView.getFloat32( offset + 44, true );
				localSeq.bbmax.y = dataView.getFloat32( offset + 48, true );
				localSeq.bbmax.z = dataView.getFloat32( offset + 52, true );

				localSeq.numblends = dataView.getInt32( offset + 56, true );
				localSeq.animindexindex = dataView.getInt32( offset + 60, true );

				// TODO: Load inline anim(x, y) structs

				localSeq.movementindex = dataView.getInt32( offset + 64, true );
				localSeq.groupsize = new Array( 2 );
				localSeq.groupsize[ 0 ] = dataView.getInt32( offset + 68, true );
				localSeq.groupsize[ 1 ] = dataView.getInt32( offset + 72, true );

				localSeq.paramindex = new Array( 2 ); // X, Y, Z, XR, YR, ZR
				localSeq.paramindex[ 0 ] = dataView.getInt32( offset + 76, true );
				localSeq.paramindex[ 1 ] = dataView.getInt32( offset + 80, true );

				localSeq.paramstart = new Array( 2 );
				localSeq.paramstart[ 0 ] = dataView.getFloat32( offset + 84, true );
				localSeq.paramstart[ 1 ] = dataView.getFloat32( offset + 88, true );

				localSeq.paramend = new Array( 2 );
				localSeq.paramend[ 0 ] = dataView.getFloat32( offset + 92, true );
				localSeq.paramend[ 1 ] = dataView.getFloat32( offset + 96, true );

				localSeq.paramparent = dataView.getInt32( offset + 100, true );

				localSeq.fadeintime = dataView.getFloat32( offset + 104, true );
				localSeq.fadeouttime = dataView.getFloat32( offset + 108, true );

				localSeq.localentrynode = dataView.getInt32( offset + 112, true );
				localSeq.localexitynode = dataView.getInt32( offset + 116, true );
				localSeq.nodeflags = dataView.getInt32( offset + 120, true );

				localSeq.entryphase = dataView.getFloat32( offset + 124, true );
				localSeq.exitphase = dataView.getFloat32( offset + 128, true );

				localSeq.lastframe = dataView.getFloat32( offset + 132, true );

				localSeq.nextseq = dataView.getInt32( offset + 136, true );
				localSeq.pose = dataView.getInt32( offset + 140, true );

				localSeq.numikrules = dataView.getInt32( offset + 144, true );

				localSeq.numautolayers = dataView.getInt32( offset + 148, true );
				localSeq.autolayerindex = dataView.getInt32( offset + 152, true );

				// TODO: Load autolayers

				localSeq.weightlistindex = dataView.getInt32( offset + 156, true );

				// TODO: Load weights

				localSeq.posekeyindex = dataView.getInt32( offset + 160, true );

				// TODO: load pose keys

				localSeq.numiklocks = dataView.getInt32( offset + 164, true );
				localSeq.iklockindex = dataView.getInt32( offset + 168, true );

				// TODO: Load ik locks

				localSeq.keyvalueindex = dataView.getInt32( offset + 172, true );
				localSeq.keyvaluesize = dataView.getInt32( offset + 176, true );

				// TODO: Load key values

				localSeq.cycleposeindex = dataView.getInt32( offset + 180, true );

				// int unused[7]

				// 7 * 4 + 184 = 212 bytes

				localSequences.push( localSeq );

			}

			// mstudioikchain_t
			const ikchains = [];
			for ( let i = 0; i < header.numikchains; i ++ ) {

				const offset = header.ikchainindex + i * 16;

				const ikchain = {};
				ikchain.name = readString( dataView, offset + dataView.getInt32( offset, true ) );
				ikchain.linktype = dataView.getInt32( offset + 4, true );
				ikchain.numlinks = dataView.getInt32( offset + 8, true );
				ikchain.linkindex = dataView.getInt32( offset + 12, true );
				ikchain.links = [];

				for ( let j = 0; j < ikchain.numlinks; j ++ ) {

					const linkOffset = offset + ikchain.linkindex + j * 28;

					const link = {};
					link.bone = dataView.getInt32( linkOffset, true );
					link.kneeDir = {};
					link.kneeDir.x = dataView.getFloat32( linkOffset + 4, true );
					link.kneeDir.y = dataView.getFloat32( linkOffset + 8, true );
					link.kneeDir.z = dataView.getFloat32( linkOffset + 12, true );
					ikchain.links.push( link );

				}

				ikchains.push( ikchain );

			}

			const skinsTable = [];
			for ( let i = 0; i < header.numskinfamilies; i ++ ) {

				const offset = header.skinindex + i * header.numskinref * 2;
				const ref = [];
				for ( let j = 0; j < header.numskinref; j ++ ) {

					ref.push( dataView.getUint16( offset + j * 2, true ) );

				}

				skinsTable.push( ref );

			}

			const surfaceProp = readString( dataView, header.surfacepropindex );

			return {
				textures,
				textureDirectories,
				includeModels,
				surfaceProp,
				bodyParts,
				bones,
				boneControllers,
				animDescriptions,
				localSequences,
				skinsTable,
				ikchains,
			};

		}

		const header = parseHeader( buffer );
		const header2 = parseSecondaryHeader( buffer, header.studiohdr2index );
		return Object.assign( { header, header2, buffer }, readData( header, header2, buffer ) );

	}

};

export { MDLLoader };
