import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Activity, 
  AlertTriangle, 
  Play, 
  Pause, 
  RotateCcw, 
  Footprints,
  Dumbbell,
  Sofa,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Componente de Cronômetro Simples
const Timer = ({ targetSeconds = 0, label }) => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const toggle = () => setIsActive(!isActive);
  const reset = () => {
    setSeconds(0);
    setIsActive(false);
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isTargetMet = targetSeconds > 0 && seconds >= targetSeconds;

  return (
    <div className="flex items-center space-x-2 bg-gray-800 p-2 rounded-lg mt-2 border border-gray-700">
      <div className={`font-mono text-lg font-bold w-16 text-center ${isTargetMet ? 'text-green-400' : 'text-white'}`}>
        {formatTime(seconds)}
      </div>
      <button onClick={toggle} className="p-1 hover:bg-gray-700 rounded text-blue-400">
        {isActive ? <Pause size={18} /> : <Play size={18} />}
      </button>
      <button onClick={reset} className="p-1 hover:bg-gray-700 rounded text-red-400">
        <RotateCcw size={18} />
      </button>
      {targetSeconds > 0 && (
        <span className="text-xs text-gray-400">Meta: {targetSeconds}s</span>
      )}
    </div>
  );
};

// Componente de Card de Exercício
const ExerciseCard = ({ exercise, onToggleSet, index }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-4 shadow-lg">
      <div 
        className="p-4 flex justify-between items-center cursor-pointer bg-gray-800 select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-900 rounded-lg text-blue-300">
            {exercise.icon}
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">{exercise.name}</h3>
            <p className="text-gray-400 text-sm">{exercise.sets} séries x {exercise.reps}</p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
      </div>

      {isOpen && (
        <div className="p-4">
          {/* Área Visual (Imagem ou Placeholder) */}
          <div className="mb-4 bg-gray-950 rounded-lg p-4 border border-gray-800 flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/3 h-48 bg-gray-800 rounded flex items-center justify-center relative overflow-hidden group">
               {exercise.image ? (
                 <img 
                   src={exercise.image} 
                   alt={exercise.name} 
                   className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                 />
               ) : (
                 <>
                   <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 z-0"></div>
                   <span className="z-10 text-gray-500 text-xs font-mono text-center px-2">
                     SEM IMAGEM:<br/>
                     <span className="text-white font-bold">{exercise.name.toUpperCase()}</span>
                   </span>
                 </>
               )}
            </div>
            <div className="md:w-2/3">
              <h4 className="text-blue-400 font-bold text-xs uppercase mb-1">Execução Correta:</h4>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{exercise.description}</p>
              {exercise.timer && <Timer targetSeconds={exercise.targetSeconds} />}
            </div>
          </div>

          {/* Controle de Séries */}
          <div className="flex justify-between items-center bg-gray-950 p-3 rounded-lg">
            <span className="text-gray-400 text-sm font-medium">Registrar Séries:</span>
            <div className="flex space-x-3">
              {Array.from({ length: exercise.sets }).map((_, setIdx) => (
                <button
                  key={setIdx}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSet(index, setIdx);
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 border-2 ${
                    exercise.completedSets[setIdx]
                      ? 'bg-green-600 border-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                      : 'bg-transparent border-gray-600 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {exercise.completedSets[setIdx] ? <CheckCircle2 size={20} /> : <span className="font-mono text-sm">{setIdx + 1}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [painLevel, setPainLevel] = useState(null); // 'low', 'high'
  const [showConfetti, setShowConfetti] = useState(false);

  const initialExercises = [
    {
      id: 1,
      name: 'Prancha Isométrica',
      sets: 3,
      reps: 'Falha Técnica',
      icon: <Activity size={24} />,
      completedSets: [false, false, false],
      timer: true,
      targetSeconds: 0,
      image: 'image_b6866b.jpg', // Supondo que esta seja a primeira imagem enviada
      description: '1. Cotovelos abaixo dos ombros.\n2. Corpo reto da cabeça aos calcanhares.\n3. Contraia glúteos e abdômen (como se fosse levar um soco).\n4. Não deixe o quadril cair.'
    },
    {
      id: 2,
      name: 'Ponte (Glute Bridge)',
      sets: 3,
      reps: '12 repetições',
      icon: <Activity size={24} />,
      completedSets: [false, false, false],
      timer: false,
      image: 'image_b68684.jpg',
      description: '1. Pés firmes no chão, largura do quadril.\n2. Suba contraindo o glúteo (não a lombar).\n3. Segure 1s no topo.\n4. Desça controlando o movimento.'
    },
    {
      id: 3,
      name: 'Perdigueiro (Bird-Dog)',
      sets: 3,
      reps: '10 cada lado',
      icon: <Activity size={24} />,
      completedSets: [false, false, false],
      timer: false,
      image: 'image_b68689.jpg',
      description: '1. Posição de 4 apoios.\n2. Estique braço direito e perna esquerda.\n3. Imagine que tem um copo d\'água nas costas (não deixe cair).\n4. Mantenha o olhar para o chão.'
    },
    {
      id: 4,
      name: 'Cadeirinha na Parede',
      sets: 3,
      reps: '30 segundos',
      icon: <Activity size={24} />,
      completedSets: [false, false, false],
      timer: true,
      targetSeconds: 30,
      image: 'image_b68723.jpg',
      description: '1. Encoste totalmente as costas na parede.\n2. Desça até os joelhos ficarem a 90º.\n3. Peso nos calcanhares, não na ponta dos pés.\n4. Mãos soltas (sem apoiar nas pernas).'
    },
    {
      id: 5,
      name: 'Elevação de Perna Reta',
      sets: 3,
      reps: '12 repetições',
      icon: <Activity size={24} />,
      completedSets: [false, false, false],
      timer: false,
      image: 'image_b68743.jpg',
      description: '1. Deite-se. Uma perna dobrada, a outra esticada.\n2. Trave o joelho da perna esticada (coxa dura).\n3. Suba até a altura do outro joelho.\n4. Desça devagar.'
    }
  ];

  const [exercises, setExercises] = useState(initialExercises);
  const [recoveryDone, setRecoveryDone] = useState(false);

  // Carregar estado (simulado, reseta ao recarregar página neste ambiente, mas usaria localStorage)
  // useEffect(() => { ... }, []);

  const toggleSet = (exerciseIndex, setIndex) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].completedSets[setIndex] = !newExercises[exerciseIndex].completedSets[setIndex];
    setExercises(newExercises);
    checkCompletion(newExercises);
  };

  const checkCompletion = (currentExercises) => {
    const allSets = currentExercises.every(ex => ex.completedSets.every(set => set));
    if (allSets && recoveryDone) setShowConfetti(true);
  };

  const calculateProgress = () => {
    let totalSets = 0;
    let setsDone = 0;
    exercises.forEach(ex => {
      totalSets += ex.sets;
      setsDone += ex.completedSets.filter(Boolean).length;
    });
    // Adiciona recuperação como "1 set"
    totalSets += 1;
    if (recoveryDone) setsDone += 1;
    
    return Math.round((setsDone / totalSets) * 100);
  };

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-blue-500 selection:text-white pb-20">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-gray-900 p-6 shadow-xl border-b border-gray-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight uppercase">Protocolo Szymanski</h1>
              <p className="text-blue-400 text-xs font-bold tracking-widest mt-1">RECUPERAÇÃO & PERFORMANCE</p>
            </div>
            <div className="text-right">
              <span className="block text-3xl font-bold text-white">{progress}%</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3 relative h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className={`absolute top-0 left-0 h-full transition-all duration-500 ease-out ${progress === 100 ? 'bg-green-500' : 'bg-blue-600'}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6 mt-4">
        
        {/* Check-in Inicial: Caminhada */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-start space-x-3 mb-4">
            <div className="p-2 bg-green-900/30 rounded-lg text-green-500">
               <Footprints size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Cardio & Joelhos</h2>
              <p className="text-gray-400 text-sm">Regra: 2km máx ou dia sim/dia não.</p>
            </div>
          </div>
          
          <div className="bg-gray-950 p-4 rounded-lg border border-gray-800">
            <p className="text-xs uppercase tracking-wide text-gray-500 font-bold mb-3">Check-in de Dor</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setPainLevel('low')}
                className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all border ${
                  painLevel === 'low' 
                    ? 'bg-green-600/20 border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]' 
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750'
                }`}
              >
                Zero / Leve
              </button>
              <button 
                onClick={() => setPainLevel('high')}
                className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all border ${
                  painLevel === 'high' 
                    ? 'bg-red-600/20 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750'
                }`}
              >
                Aguda / Inflamado
              </button>
            </div>
            
            {painLevel === 'low' && (
              <div className="mt-4 p-3 bg-green-900/10 border-l-4 border-green-500 text-green-100 text-sm flex items-center animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 size={16} className="mr-2 text-green-500" />
                <span>Liberado para caminhada leve (Max 2km).</span>
              </div>
            )}
            
            {painLevel === 'high' && (
              <div className="mt-4 p-3 bg-red-900/10 border-l-4 border-red-500 text-red-100 text-sm flex items-start animate-in fade-in slide-in-from-top-2">
                <AlertTriangle size={16} className="mr-2 mt-0.5 shrink-0 text-red-500" />
                <span><strong className="text-red-400">PARE.</strong> Hoje é descanso total de impacto. Foque apenas no fortalecimento.</span>
              </div>
            )}
          </div>
        </section>

        {/* Treino Principal */}
        <section>
          <div className="flex items-center space-x-2 mb-4 px-1">
            <Dumbbell className="text-blue-500" size={20} />
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Fortalecimento (20 min)</h2>
          </div>
          
          {exercises.map((exercise, index) => (
            <ExerciseCard 
              key={exercise.id} 
              exercise={exercise} 
              index={index} 
              onToggleSet={toggleSet} 
            />
          ))}
        </section>

        {/* Recuperação Final */}
        <section className={`transition-opacity duration-500 ${progress < 80 ? 'opacity-50' : 'opacity-100'}`}>
          <div className="flex items-center space-x-2 mb-4 px-1">
            <Sofa className="text-purple-500" size={20} />
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Descompressão</h2>
          </div>

          <div 
            onClick={() => setRecoveryDone(!recoveryDone)}
            className={`bg-gray-900 border transition-all cursor-pointer rounded-xl p-5 shadow-lg flex items-center justify-between group ${
              recoveryDone ? 'border-purple-500 bg-purple-900/10 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : 'border-gray-800 hover:border-gray-600'
            }`}
          >
            <div>
              <h3 className={`font-bold text-lg ${recoveryDone ? 'text-purple-400' : 'text-white'}`}>Posição de Alívio</h3>
              <p className="text-gray-400 text-sm mt-1">Pernas para cima no sofá/parede por 15 min.</p>
            </div>
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${
              recoveryDone ? 'bg-purple-600 border-purple-600' : 'border-gray-600 group-hover:border-purple-400'
            }`}>
              {recoveryDone && <CheckCircle2 size={24} className="text-white" />}
            </div>
          </div>
        </section>

        {/* Status Final */}
        {progress === 100 && (
          <div className="bg-gradient-to-r from-green-900 to-emerald-900 p-8 rounded-xl text-center border border-green-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-in zoom-in duration-300">
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">TREINO CONCLUÍDO</h2>
            <p className="text-green-100 font-medium">Disciplina é liberdade. Amanhã tem mais.</p>
          </div>
        )}

        <div className="text-center text-gray-700 text-[10px] uppercase tracking-widest mt-12 pb-8">
          Szymanski Advogados • Private Protocol v1.1
        </div>

      </div>
    </div>
  );
}