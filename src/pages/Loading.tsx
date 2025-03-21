import '../styles/pages/Loading.css';

interface LoadingProps {
    background?: string;
}


const Loading: React.FC<LoadingProps> = ({background}) => {
    return (
        <div className="loading-page" style={{backgroundColor: background? background : "var(--color1)"}}>
            <div className="circles">
                <div className="circle"></div>
                <div className="circle"></div>
                <div className="circle"></div>
            </div>
        </div>
    )
}

export default Loading;