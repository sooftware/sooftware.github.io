import React from 'react';
import { Helmet } from 'react-helmet';

import { css } from '@emotion/react';

import { Footer } from '../components/Footer';
import SiteNav from '../components/header/SiteNav';
import { ResumeContent } from '../components/ResumeContent';
import { Wrapper } from '../components/Wrapper';
import IndexLayout from '../layouts';
import {
  inner,
  outer,
  SiteArchiveHeader,
  SiteHeader,
  SiteMain,
  SiteNavMain,
} from '../styles/shared';
import { NoImage, PostFull, PostFullHeader, PostFullTitle } from '../templates/post';
import { colors } from '../styles/colors';

const PageTemplate = css`
  .site-main {
    margin-top: 64px;
    padding-bottom: 4vw;
    background: #fff;
  }

  @media (prefers-color-scheme: dark) {
    .site-main {
      /* background: var(--darkmode); */
      background: ${colors.darkmode};
    }
  }
`;

const About: React.FC = () => (
  <IndexLayout>
    <Helmet>
      <title>About Me</title>
    </Helmet>

    <Wrapper css={PageTemplate}>
      <header className="site-archive-header no-image" css={[SiteHeader, SiteArchiveHeader]}>
        <div css={[outer, SiteNavMain]}>
          <div css={inner}>
            <SiteNav isHome={false} />
          </div>
        </div>
      </header>
      <main id="site-main" className="site-main" css={[SiteMain, outer]}>
        <div css={inner}>
          <article className="post page" css={[PostFull, NoImage]}>
            <PostFullHeader className="post-full-header">
              <PostFullTitle className="post-full-title">About</PostFullTitle>
            </PostFullHeader>

            <ResumeContent className="post-full-content">
              <div className="post-content">
                <h4><span>Int</span>ro</h4>
                <hr></hr>

                <p>
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  Hi, I'm Soohwan Kim. I am the co-founder and A.I. engineer of <a href="http://www.tunib.ai">TUNiB</a>.
                  On this page, I would like to introduce myself in a free format, not in a hard format like resume. If you want to see my resume, check <a href="https://sooftware.github.io/resume">here</a>.
                </p>

                <br></br>
                <h4><span>Cur</span>rently</h4>
                <hr></hr>

                <p>
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  At TUNiB, I'm trying to make a global persona chatbot.
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  Meanwhile, I am also working on open-source activities for the development of natural language processing in Korea. You can check my github (http://github.com/sooftware) to see what I've done and I'm doing.
                </p>

                <br></br>
                <h4><span>Som</span>e history</h4>
                <hr></hr>

                <p>
                  <li>I was born on October 11, 1995, in Cheonan, South Korea.</li>
                  <li>When I was 4 years old (1998), I first got a computer at home. I used to play simple games with Windows 98 OS.</li>
                  <li>Until I turned 20, I had a normal time in my hometown of Cheonan. After I turned 20, I entered Department of Electronic and Communication Engineering at Kwangwoon University and started living alone in Seoul.</li>
                  <li>Surprisingly, I received academic warnings three times in a row after entering university. In other words, I was expelled from school.</li>
                  <li>Realizing that I was in trouble, I applied to the Republic of Korea Marine Corps to change myself. (In South Korea, men are obligated to serve in the military.)</li>
                  <li>In the Marine Corps, I think it was hard but changed a lot on my own.</li>
                  <li>After being discharged from the Marine Corps, I re-entered Kwangwoon University. Fortunately, I had a chance to re-admission system.</li>
                  <li>After re-admission, I concentrated on studying and received several academic excellence awards. At this time, I became very interested in programming.</li>
                  <li>I was not very interested in electronics among my majors. I focused on Computer Science. Especially, I used to like making things myself. <a href="http://blog.naver.com/sooftware/221339061745?rvid=D404BDEA594C89DC02783EEDE749FF3FC015">This</a> is the result of my first project! I made a simple game in c language.</li>
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  <li>Since I was in the junior at university, I minored in Data Science. I think I've stepped into the machine learning world since then.</li>
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  <li>When I was a junior at university, I participated in the 2019 Naver AI Hackathon - Speech Competition with two friends. The theme of the competition was "Korean speech recognition". It was the first deep learning we did other than MNIST, but we achieved 12th place out of 100 teams.</li>
                  <li>After the competition, I and my friends felt the need for an open source of Korean speech recognition and started making it. This is the start of the <a href="https://github.com/sooftware/kospeech">KoSpeech</a>.</li>
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  <li>I was fascinated by the A.I. speech field. So, in the first semester of my fourth year of university, I entered as an undergraduate researcher at Sogang University's <a href="https://speech.sogang.ac.kr/speech/index.html">auditory intelligence lab</a>.</li>
                  <li>When I entered the lab, I was able to learn a lot of knowledge about the traditional speech recognition method as well as the latest speech recognition technology.</li>
                  <li>In July 2020, I received an internship offer from Kakao Brain natural language processing team I admired! This was one of the happiest things in my life.</li>
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  <li>After the interview, I started the Kakao Brain internship. My internship project was to develop a multi-lingual speech recognition and speech synthesis module that will be mounted in a library called <a href="https://github.com/kakaobrain/pororo">pororo</a>. Fortunately, thanks to the company's consideration, I was able to do an internship while taking the last semester of university.</li>
                  <li>After successfully completing the internship project, I joined Kakao Brain as a full-time employee!</li>
                  <li>The most representative thing I did on Kakao Brain was participating in the development of the NLP library named <a href="https://github.com/kakaobrain/pororo">pororo</a>. I developed the speech recognition and speech synthesis module of pororo.</li>
                  <li>Working at Kakao Brain was more than 100% satisfied. However, I and my team members left Kakao Brain to create a startup named TUNiB for a new challenge.</li>
                  <li>In March 2021, we founded a startup named TUNiB!</li>
                  <li>Now I'm trying to make a global persona chatbot.</li>
                </p>

                <br></br>
                <h4><span>I li</span>ke</h4>
                <hr></hr>

                <p>
                  <li>Coffee (especially americano & einspanner)</li>
                  <li>Walking</li>
                  <li>Webtoon</li>
                  <li>Singing (Rock & Rap)</li>
                  <li>Spring/Fall</li>
                  <li>Spicy food</li>
                  <li>Beer</li>
                  <li>Calm Down Man (Youtuber)</li>
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  <li>Keyboard (I'm using *REAL FORCE* now.)</li>
                  <li>Netflix</li>
                </p>

                <br></br>
                <h4><span>Fun</span> facts</h4>
                <hr></hr>

                <p>
                  <li>My company use English names, not their original names.</li>
                  <li>My English name is Kaki. My girlfriend named me that I look good in it.</li>
                  <li>Our startup name TUNiB was inspired by an <a href="https://octonauts.fandom.com/wiki/Tunip_the_Vegimal">animation character</a>.</li>
                  <li>After we founded TUNiB, we went to Jeju Island for a month and stayed together.</li>
                </p>

                <br></br>
                <h4><span>I dr</span>eam of</h4>
                <hr></hr>

                <p>
                  <li>becoming an irreplaceable engineer.</li>
                  <li>creating a very high-quality artificial intelligence chatbot like Jarvis.</li>
                  <li>TUNiB becoming an unicorn.</li>
                </p>

              </div>
            </ResumeContent>
          </article>
        </div>
      </main>
      <Footer />
    </Wrapper>
  </IndexLayout>
);

export default About;
