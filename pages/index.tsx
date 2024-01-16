import { ConnectWallet, useAddress } from "@thirdweb-dev/react";
import { NextPage } from "next";
import { useEffect, useRef, useState } from "react";

const backgrounds= [
  '/bg1.png',
  '/bg2.png',
  '/bg3.png',
];

const shapes = [
  '/shape1.png',
  '/shape2.png',
  '/shape3.png',
];

const Home: NextPage = () => {
  const address = useAddress();

  const [background, setBackground] = useState<string>('');
  const [shape, setShape] = useState<string>('');
  const [nftName, setNftName] = useState<string>('');
  const [isNFTMinting, setIsNFTMinting] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if(!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if(background && shape && ctx) {
      const backgroundImage = new globalThis.Image();
      backgroundImage.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

        const shapeImage = new globalThis.Image();
        shapeImage.onload = () => {
          ctx.drawImage(shapeImage, 0, 0, canvas.width, canvas.height);
        };
        shapeImage.src = shape;
      };
      backgroundImage.src = background;
    }
  }, [background, shape]);

  const convertCanvasToBlob = () => {
    const canvas = canvasRef.current;
    if(canvas) {
      canvas.toBlob((blob) => {
        if(blob) {
          sendNFTMintRequest(blob);
        }
      }), 'image/png';
    }
  };

  const sendNFTMintRequest = async (blob: Blob) => {
    const formData = new FormData();
    formData.append('image', blob, 'nft.png');
    formData.append('name', nftName);
    formData.append('address', address || '');

    setIsNFTMinting(true);
    try {
      const response = await fetch('/api/mintNFT', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();

      if(!response.ok) {
        throw new Error(data.message);
      }

      alert('NFT minted successfully!');
    } catch (error) {
      console.error(error);
    } finally {
      setIsNFTMinting(false);
      setBackground('');
      setShape('');
      setNftName('');
    }
  };

  if(!address) {
    return(
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}>
        <ConnectWallet />
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'center',
      marginTop: '40px'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '2rem',
        backgroundColor: '#333',
        borderRadius: '10px',
        marginRight: '2rem',
      }}>
        <ConnectWallet
          style={{ width: '100%' }}
        />
        <div>
          <h3>Select a background:</h3>
          {backgrounds.map((bg) => (
            <img 
              key={bg}
              src={bg}
              onClick={() => setBackground(bg)}
              style={{ 
                width: '100px', 
                cursor: 'pointer', 
                border: background === bg ? '2px solid royalblue' : '',
                marginRight: '1rem',
              }}
            />
          ))}
        </div>
        <div>
          <h3>Select a shape:</h3>
          {shapes.map((sh) => (
            <img 
              key={sh}
              src={sh}
              onClick={() => setShape(sh)}
              style={{ 
                width: '100px', 
                cursor: 'pointer', 
                border: shape === sh ? '2px solid royalblue' : '',
                marginRight: '1rem',
              }}
            />
          ))}
        </div>
        <div style={{ width: '100%'}}>
          <h3>Create a name:</h3>
          <input 
            type="text" 
            placeholder="NFT name"
            value={nftName}
            onChange={(e) => setNftName(e.target.value)}
            style={{ 
              padding: '1rem', 
              marginTop: '1rem',
              border: '1px solid #ccc',
              borderRadius: '5px',
              width: '100%',
            }}
          />
        </div>
        {background && shape && nftName && (
          <button
            style={{
              padding: '1rem',
              marginTop: '3rem',
              cursor: 'pointer',
              backgroundColor: 'royalblue',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              width: '100%',
            }}
            disabled={isNFTMinting}
            onClick={convertCanvasToBlob}
          >
            {isNFTMinting ? 'Minting...' : 'Mint NFT'}
          </button>
        )}
      </div>
      <div>
        <canvas ref={canvasRef} width="500" height="500" style={{ border: '1px solid black', marginTop: '20px' }}></canvas>
      </div>
    </div>
  );
};

export default Home;
